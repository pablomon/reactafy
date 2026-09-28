"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { changeMyPassword, saveMyAccount } from "@/services/accountService";
import { loginUrl } from "@/services/loginRedirect";
import { startSession } from "@/services/wordpressAuth";

// Mismo formato que AddressFormState (direcciones)
export type AccountFormState = {
    status: "idle" | "saved" | "error";
    message?: string;
    fields?: Record<string, string>;
    values?: Record<string, string>;
};

function text(formData: FormData, name: string): string {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
}

// Nombre, apellidos y email
export async function saveAccount(_previous: AccountFormState, formData: FormData): Promise<AccountFormState> {
    const values = {
        first_name: text(formData, "first_name"),
        last_name: text(formData, "last_name"),
        email: text(formData, "email"),
    };

    const result = await saveMyAccount(values);

    if (!result.ok) {
        if (result.reason === "unauthorized") {
            redirect(await loginUrl());
        }

        return { status: "error", message: result.message, fields: result.fields, values };
    }

    // El nombre y el email también salen en el menú lateral (layout)
    revalidatePath("/zona-de-usuario/", "layout");

    const user = result.data;

    return {
        status: "saved",
        values: { first_name: user.firstName, last_name: user.lastName, email: user.email },
    };
}

// Cambiar la contraseña sabiendo la actual
export async function changePassword(_previous: AccountFormState, formData: FormData): Promise<AccountFormState> {
    // Las contraseñas no se recortan
    const current = String(formData.get("current_password") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (!password) {
        return { status: "error", fields: { password: "Elige una contraseña nueva." } };
    }

    if (password !== confirm) {
        return { status: "error", fields: { confirm: "Las contraseñas no coinciden." } };
    }

    const result = await changeMyPassword({ current_password: current, password });

    if (!result.ok) {
        if (result.reason === "unauthorized") {
            redirect(await loginUrl());
        }

        return { status: "error", message: result.message, fields: result.fields };
    }

    // Se renueva la cookie con un token nuevo, pedido con la contraseña
    // nueva. Si fallara, la sesión actual sigue valiendo: no es un error.
    try {
        await startSession(result.data.login, password);
    } catch (error) {
        console.error("changePassword: no se pudo renovar la sesión", error);
    }

    return { status: "saved" };
}
