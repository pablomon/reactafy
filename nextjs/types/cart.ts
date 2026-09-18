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
    totals: {
        total_items: Money;
        total_price: Money;
        total_tax: Money;
    };
};