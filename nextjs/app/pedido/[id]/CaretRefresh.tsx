"use client";

import { useContext, useEffect } from "react";
import { CartContext } from "@/app/context/CartContext";

export default function CartRefresh() {
    const { refreshCart } =
        useContext(CartContext);

    useEffect(() => {
        refreshCart();
    }, []);

    return null;
}