import { Money } from "./money";

export type CartLine = {
    key: string;
    id: number;
    quantity: number;
    name: string;
    images: {
        id: number;
        src: string;
        thumbnail: string;
        alt: string;
    }[];
    variation: {
        raw_attribute: string;
        attribute: string;
        value: string;
    }[];
    prices: {
        price: Money;
    };
    totals: {
        line_subtotal: Money;
        line_total: Money;
    };
};

export type Cart = {
    items: CartLine[];
    items_count: number;
    // null cuando no existe sesión de carrito en WooCommerce (invitado
    // sin cartToken): no se le pregunta a Woo, así que no hay importes
    // ni moneda que mostrar.
    totals: {
        total_items: Money;
        total_price: Money;
        total_tax: Money;
    } | null;
};