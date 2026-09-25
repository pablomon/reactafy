"use client";

import {
    createContext,
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";

import type { Cart } from "@/types/cart";

import {
    getCart,
    addItem as addCartItem,
    updateItem as updateCartItem,
    removeItem as removeCartItem,
} from "@/services/cartService";

type CartContextType = {
    cart: Cart | null;
    addItem: (id: number, quantity: number) => Promise<void>;
    updateItem: (key: string, quantity: number) => Promise<void>;
    changeQuantity: (key: string, delta: number) => void;
    setQuantity: (key: string, quantity: number) => void;
    removeItem: (key: string) => Promise<void>;
    refreshCart: () => Promise<void>;
    // true mientras haya cambios sin confirmar por Woo (clics en
    // debounce o peticiones en la cola).
    isSyncing: boolean;
    // Panel "Cesta"
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
};

type CartProviderProps = {
    children: ReactNode;
};

const QUANTITY_DEBOUNCE_MS = 400;

export const CartContext = createContext<CartContextType>({
    cart: null,
    addItem: async () => { },
    updateItem: async () => { },
    changeQuantity: () => { },
    setQuantity: () => { },
    removeItem: async () => { },
    refreshCart: async () => { },
    isSyncing: false,
    isOpen: false,
    openCart: () => { },
    closeCart: () => { },
});

export default function CartProvider(props: CartProviderProps) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // useCallback: la misma función en cada render. CartDrawer las usa
    // en las dependencias de sus efectos; si cambiaran en cada render,
    // esos efectos se repetirían sin parar.
    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);
    // Cambios pendientes: peticiones en la cola + clics en debounce.
    const [pending, setPending] = useState(0);

    // Último carrito conocido (incluye los cambios optimistas), sin esperar al render.
    const cartRef = useRef<Cart | null>(null);
    // Cola: las peticiones a Woo van de una en una para no pisar la sesión.
    const queueRef = useRef<Promise<void>>(Promise.resolve());
    const lastRequestRef = useRef(0);
    // Clics pendientes de enviar, por línea del carrito.
    const timersRef = useRef(
        new Map<string, ReturnType<typeof setTimeout>>()
    );

    function applyCart(next: Cart) {
        cartRef.current = next;
        setCart(next);
    }

    // Encola una petición y solo aplica su respuesta si es la más reciente
    // y no hay clics pendientes (si no, borraría el cambio optimista).
    function enqueue(request: () => Promise<Cart>): Promise<void> {
        const requestId = ++lastRequestRef.current;
        setPending((n) => n + 1);

        const run = async () => {
            try {
                const next = await request();

                if (
                    requestId === lastRequestRef.current &&
                    timersRef.current.size === 0
                ) {
                    applyCart(next);
                }
            } catch (error) {
                console.error("Cart request failed:", error);

                // Rollback: volvemos a lo que diga Woo.
                const fresh = await getCart().catch(() => null);
                if (fresh) applyCart(fresh);

                throw error;
            } finally {
                setPending((n) => n - 1);
            }
        };

        const result = queueRef.current.then(run);
        queueRef.current = result.catch(() => { });
        return result;
    }

    function cancelPending(key: string) {
        const timer = timersRef.current.get(key);

        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(key);
            setPending((n) => n - 1);
        }
    }

    useEffect(() => {
        refreshCart();

        const timers = timersRef.current;
        return () => timers.forEach(clearTimeout);
    }, []);

    async function refreshCart() {
        try {
            await enqueue(getCart);
        } catch (error) {
            console.error("Failed to load cart:", error);
        }
    }

    function addItem(id: number, quantity: number) {
        return enqueue(() => addCartItem(id, quantity));
    }

    function updateItem(key: string, quantity: number) {
        cancelPending(key);
        return enqueue(() => updateCartItem(key, quantity));
    }

    function removeItem(key: string) {
        cancelPending(key);

        const current = cartRef.current;
        if (current) {
            applyCart({
                ...current,
                items: current.items.filter((i) => i.key !== key),
            });
        }

        return enqueue(() => removeCartItem(key));
    }

    // +1 / −1 sobre la cantidad más reciente.
    function changeQuantity(key: string, delta: number) {
        const item = cartRef.current?.items.find((i) => i.key === key);
        if (!item) return;

        setQuantity(key, item.quantity + delta);
    }

    // Cantidad exacta (campo numérico o botones), optimista y con
    // debounce por línea: solo se envía a Woo el último valor.
    function setQuantity(key: string, quantity: number) {
        const current = cartRef.current;
        const item = current?.items.find((i) => i.key === key);
        if (!current || !item) return;

        if (quantity < 1) {
            removeItem(key).catch(() => { });
            return;
        }

        applyCart({
            ...current,
            items: current.items.map((i) =>
                i.key === key ? { ...i, quantity } : i
            ),
        });

        cancelPending(key);
        setPending((n) => n + 1);
        timersRef.current.set(
            key,
            setTimeout(() => {
                timersRef.current.delete(key);
                setPending((n) => n - 1);
                enqueue(() => updateCartItem(key, quantity)).catch(() => { });
            }, QUANTITY_DEBOUNCE_MS)
        );
    }

    return (
        <CartContext.Provider
            value={{
                cart,
                addItem,
                updateItem,
                changeQuantity,
                setQuantity,
                removeItem,
                refreshCart,
                isSyncing: pending > 0,
                isOpen,
                openCart,
                closeCart,
            }}
        >
            {props.children}
        </CartContext.Provider>
    );
}
