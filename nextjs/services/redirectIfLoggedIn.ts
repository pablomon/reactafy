import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getMe } from "@/services/accountService";

// Login y registro: si ya hay sesión válida no tiene sentido enseñar
// el formulario, se va directamente a `next`. Solo pregunta a
// WordPress si hay cookie (sin cookie no hay sesión seguro).
export async function redirectIfLoggedIn(next: string) {
    if (!(await cookies()).has("authToken")) {
        return;
    }

    const me = await getMe();

    if (me.ok) {
        redirect(next);
    }
}
