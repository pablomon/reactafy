import type { Money } from "./money";

// Zona de usuario. Reflejan las respuestas de reactafy/v1:
// GET /me, GET /me/orders, GET /orders/{id} y /me/addresses.

export type AccountUser = {
    id: number;
    email: string;
    name: string;        // nombre visible ("Nombre Apellidos")
    firstName: string;
    lastName: string;
};

// Una fila del listado de pedidos
export type OrderSummary = {
    id: number;
    number: string;         // lo que ve el cliente: "#16398"
    date: string | null;    // ISO 8601
    status: string;         // código de Woo: "processing"
    statusLabel: string;    // nombre de Woo: "Procesando"
    total: Money;
    itemCount: number;
};

export type OrdersPage = {
    orders: OrderSummary[];
    pagination: {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
    };
};

export type OrderDetailItem = {
    id: number;
    name: string;
    quantity: number;
    total: Money;
    image: string | null;
};

export type OrderDetail = Omit<OrderSummary, "itemCount"> & {
    subtotal: Money;
    shipping: Money;
    discount: Money;
    tax: Money;
    paymentMethod: string;
    billingAddress: string[];   // líneas ya formateadas por Woo
    shippingAddress: string[];
    items: OrderDetailItem[];
};

// ---------- Direcciones (GET /me/addresses) ----------

// Un campo tal como lo define WooCommerce (el formulario se pinta
// a partir de esto: no hay campos escritos a mano en Next)
export type AddressField = {
    key: string;                    // "billing_postcode"
    label: string;                  // "Código postal"
    type: "text" | "email" | "tel" | "select" | "textarea";
    required: boolean;
    half: boolean;                  // media anchura (nombre, apellidos)
    placeholder: string;
    autocomplete: string;
    options: { value: string; label: string }[] | null;
    help?: string;                  // texto de ayuda (description del campo en Woo)
};

export type AddressType = "billing" | "shipping";

export type AddressBlock = {
    country: string;
    fields: AddressField[];
    values: Record<string, string>;
};

export type MyAddresses = {
    billing: AddressBlock;
    // null: la tienda no envía o envía siempre a la de facturación
    shipping: AddressBlock | null;
};
