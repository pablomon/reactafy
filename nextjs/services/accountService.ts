import { cookies } from "next/headers";

import { siteConfig } from "@/config/site";
import type {
    AccountUser,
    AddressBlock,
    AddressType,
    MyAddresses,
    OrderDetail,
    OrdersPage,
} from "@/types/account";

const API_URL = `${siteConfig.WORDPRESS_URL}/wp-json/reactafy/v1`;

// Resultado de una petición de la zona de usuario:
//  - "unauthorized": sin sesión o token caducado → la página manda a /login/
//  - "not-found": no existe o no es de este usuario → 404
type AccountResult<T> =
    | { ok: true; data: T }
    | { ok: false; reason: "unauthorized" | "not-found" };

// GET a WordPress con el token de la cookie. Solo en el servidor
// (usa cookies() de next/headers, que no existe en el navegador):
// la cookie es httpOnly y el token nunca llega al navegador.
// Nunca se cachea: son datos de una persona concreta.
async function accountFetch<T>(path: string): Promise<AccountResult<T>> {
    const token = (await cookies()).get("authToken")?.value;

    if (!token) {
        return { ok: false, reason: "unauthorized" };
    }

    const response = await fetch(`${API_URL}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    // 404, o 403 "forbidden" de /orders/{id} (el pedido es de otra
    // persona): para quien mira, simplemente no existe.
    if (response.status === 404) {
        return { ok: false, reason: "not-found" };
    }

    if (response.status === 403) {
        const body = await response.json().catch(() => null);

        if (body?.code === "forbidden") {
            return { ok: false, reason: "not-found" };
        }
    }

    // 401/403: sin sesión, o token caducado/no válido (el plugin JWT
    // responde 403 con jwt_auth_…)
    if (response.status === 401 || response.status === 403) {
        return { ok: false, reason: "unauthorized" };
    }

    if (!response.ok) {
        throw new Error(`Zona de usuario: ${path} respondió ${response.status}`);
    }

    return { ok: true, data: (await response.json()) as T };
}

export function getMe() {
    return accountFetch<AccountUser>("/me");
}

export function getMyOrders(page = 1, perPage = siteConfig.ORDERS_PER_PAGE) {
    return accountFetch<OrdersPage>(`/me/orders?page=${page}&perPage=${perPage}`);
}

export function getMyOrder(id: number) {
    return accountFetch<OrderDetail>(`/orders/${id}`);
}

export function getMyAddresses() {
    return accountFetch<MyAddresses>("/me/addresses");
}

// ---------- Escritura ----------

// Resultado de guardar: además de los casos de lectura, "invalid"
// trae los errores de cada campo tal como los valida WordPress.
export type SaveResult<T> =
    | { ok: true; data: T }
    | { ok: false; reason: "unauthorized" }
    | { ok: false; reason: "invalid"; message: string; fields: Record<string, string> };

// POST a WordPress con el token de la cookie (solo en el servidor)
async function accountPost<T>(path: string, body: unknown): Promise<SaveResult<T>> {
    const token = (await cookies()).get("authToken")?.value;

    if (!token) {
        return { ok: false, reason: "unauthorized" };
    }

    const response = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (response.status === 400) {
        return {
            ok: false,
            reason: "invalid",
            message: data?.message ?? "Revisa los campos marcados.",
            fields: data?.data?.fields ?? {},
        };
    }

    if (response.status === 401 || response.status === 403) {
        return { ok: false, reason: "unauthorized" };
    }

    if (!response.ok) {
        throw new Error(`Zona de usuario: ${path} respondió ${response.status}`);
    }

    return { ok: true, data: data as T };
}

export function saveMyAddress(type: AddressType, values: Record<string, string>) {
    return accountPost<AddressBlock>(`/me/addresses/${type}`, values);
}

export function saveMyAccount(values: { first_name: string; last_name: string; email: string }) {
    return accountPost<AccountUser>("/me/account", values);
}

// Devuelve el login para volver a abrir sesión con la contraseña nueva
export function changeMyPassword(values: { current_password: string; password: string }) {
    return accountPost<{ login: string }>("/me/password", values);
}
