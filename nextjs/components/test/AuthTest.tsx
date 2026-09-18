"use client";

import { useContext } from "react";
import { AuthContext } from "@/app/context/AuthContext";

export default function AuthTest() {

    const auth = useContext(AuthContext);

    return (
        <div>
            {auth.user ? (
                <p>Usuario: {auth.user.name}</p>
            ) : (
                <p>No autenticado</p>
            )}
        </div>
    );
}