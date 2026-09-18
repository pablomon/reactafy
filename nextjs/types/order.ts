export type OrderItem = {
    id: number;
    name: string;
    quantity: number;
    total: string;
    image: string | null;
};

export type Order = {
    id: number;
    status: string;
    total: string;
    tax: string;
    currency: string;
    items: OrderItem[];
};