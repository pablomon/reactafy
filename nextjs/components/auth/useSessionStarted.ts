"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { AuthFormState } from "@/services/authActions";

// Tras abrir sesión (status "session"), ir a `next`.
//
// En el login y el registro normalmente ni llega a hacer falta: al
// poner la cookie, Next vuelve a pintar la página en el servidor, esta
// ve que ya hay sesión y redirige a `next` ella sola. Sirve para la
// página de nueva contraseña, que no redirige.
//
// El header y el carrito no se tocan aquí: AuthContext comprueba la
// sesión al cambiar de página y el carrito se recarga cuando cambia el
// usuario.
export function useSessionStarted(state: AuthFormState) {
    const router = useRouter();

    useEffect(() => {
        if (state.status === "session") {
            router.replace(state.next ?? "/zona-de-usuario/");
        }
    }, [state, router]);
}
