"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DEMO_COOKIE, demoToken } from "@/services/demoAccess";

export type AccessFormState = { error?: string };

// Comprueba la contraseña de acceso y deja la cookie (30 días)
export async function enterDemo(_previous: AccessFormState, formData: FormData): Promise<AccessFormState> {
    const password = process.env.DEMO_PASSWORD;
    const given = String(formData.get("password") ?? "");
    const next = String(formData.get("next") ?? "/");

    if (!password) {
        redirect("/");
    }

    if (given !== password) {
        return { error: "La contraseña no es correcta." };
    }

    (await cookies()).set(DEMO_COOKIE, await demoToken(password), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    });

    // Solo rutas de esta web (ver utils/safeNext.ts)
    redirect(next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/");
}
