"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { saveMyAddress } from "@/services/accountService";
import type { AddressType } from "@/types/account";
import { loginUrl } from "@/services/loginRedirect";

// Página de cada formulario, para revalidarla al guardar
const PAGES: Record<AddressType, string> = {
    shipping: "/zona-de-usuario/entrega/",
    billing: "/zona-de-usuario/facturacion/",
};

// Lo que el formulario recibe tras guardar (useActionState)
export type AddressFormState = {
    status: "idle" | "saved" | "error";
    message?: string;
    // Error de cada campo: { billing_postcode: "El código postal no es válido." }
    fields?: Record<string, string>;
    // Lo que había escrito el usuario: tras enviar, React vacía el
    // formulario y lo rellena con estos valores (así no se pierde nada
    // si hay un error)
    values?: Record<string, string>;
};

// Server Action: se ejecuta en el servidor de Next, no en el navegador.
// El <form> la llama al enviarse; aquí se leen los campos, se mandan a
// WordPress con el token de la cookie y se devuelve el resultado.
//
// `type` va "atado" desde el formulario (saveAddress.bind(null, "billing")):
// así no viaja como un campo que alguien pudiera cambiar a mano.
export async function saveAddress(
    type: AddressType,
    _previous: AddressFormState,
    formData: FormData
): Promise<AddressFormState> {
    // Solo los campos de esta dirección (billing_… o shipping_…). El
    // resto de lo que trae el FormData son cosas internas de Next
    // ($ACTION_…). WordPress vuelve a filtrar igualmente.
    const values: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
        if (key.startsWith(`${type}_`) && typeof value === "string") {
            values[key] = value;
        }
    }

    const result = await saveMyAddress(type, values);

    if (!result.ok) {
        if (result.reason === "unauthorized") {
            redirect(await loginUrl());
        }

        return {
            status: "error",
            message: result.message,
            fields: result.fields,
            values,
        };
    }

    // La página vuelve a pedir los datos a WordPress
    revalidatePath(PAGES[type]);

    return { status: "saved", values: result.data.values };
}
