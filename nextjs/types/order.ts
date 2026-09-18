import type { Money } from "./money";

export type OrderItem = {
    id: number;
    name: string;
    quantity: number;
    total: Money;
    image: string | null;
};

export type Order = {
    id: number;
    status: string;
    total: Money;
    tax: Money;
    items: OrderItem[];
};