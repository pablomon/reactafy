"use client";

import { useContext, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { AuthContext } from "@/app/context/AuthContext";
import { CartContext } from "@/app/context/CartContext";
import type { AuthFormState } from "@/services/authActions";

// Cuando una Server Action abre sesión (status "session"), la cookie
// ya está puesta, pero el navegador no lo sabe: el header ("Mi
// cuenta") y el carrito (el del usuario, no el de invitado) se leyeron
// al cargar la página. Aquí se vuelven a leer y después se navega a
// `next`, sin recargar la página entera.
export function useSessionStarted(state: AuthFormState) {
    const { refreshUser } = useContext(AuthContext);
    const { refreshCart } = useContext(CartContext);
    const router = useRouter();

    // Cada respuesta de la acción es un objeto nuevo: se recuerda la
    // última atendida para no navegar dos veces con la misma
    const handled = useRef<AuthFormState | null>(null);

    useEffect(() => {
        if (state.status !== "session" || handled.current === state) {
            return;
        }

        handled.current = state;

        Promise.all([refreshUser(), refreshCart()]).finally(() => {
            // refresh() vacía la caché de páginas del navegador (Router
            // Cache): si alguna se guardó sin sesión (p. ej. la zona de
            // usuario al cerrar sesión), no se reutiliza
            router.refresh();
            router.replace(state.next ?? "/zona-de-usuario/");
        });
    }, [state, refreshUser, refreshCart, router]);
}
