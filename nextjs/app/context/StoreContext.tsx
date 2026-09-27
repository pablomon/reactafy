"use client";

import { createContext, useContext } from "react";

import type { Store } from "@/types/store";

// Los ajustes de la tienda para los Client Components (la cesta).
// El layout los pide en el servidor y los reparte con este contexto;
// los Server Components llaman a getStore() directamente.
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({
    value,
    children,
}: {
    value: Store;
    children: React.ReactNode;
}) {
    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// Atajo para leerlo. Falla con un mensaje claro si se usa fuera del Provider.
export function useStore(): Store {
    const store = useContext(StoreContext);

    if (!store) {
        throw new Error("useStore() debe usarse dentro de <StoreProvider>");
    }

    return store;
}
