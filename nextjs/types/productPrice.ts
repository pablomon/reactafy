import {Money} from "@/types/money";

export type ProductPrice = {
    price: Money;
    fromPrice: Money | null;
};