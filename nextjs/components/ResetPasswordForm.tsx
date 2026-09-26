"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type ResetPasswordFormProps = {
    // "key" es un nombre reservado en React, por eso resetKey.
    resetKey: string;
    login: string;
};

export default function ResetPasswordForm({
    resetKey,
    login,
}: ResetPasswordFormProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Contraseña cambiada pero sin sesión abierta (respuesta 202).
    const [changedMessage, setChangedMessage] =
        useState<string | null>(null);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError(null);

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "/api/auth/password/reset/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        login,
                        key: resetKey,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ??
                    "No se pudo cambiar la contraseña."
                );
                return;
            }

            if (response.status === 202) {
                setChangedMessage(
                    data.message ??
                    "Contraseña cambiada. Inicia sesión para continuar."
                );
                return;
            }

            // Sesión abierta. Recarga completa para que el contexto
            // de usuario y el carrito se lean de nuevo.
            window.location.href = "/";
        } catch {
            setError(
                "No se pudo conectar con el servidor."
            );
        } finally {
            setLoading(false);
        }
    }

    if (changedMessage) {
        return (
            <div role="status">
                <p>{changedMessage}</p>

                <Link href="/login">
                    Iniciar sesión
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="password">
                    Contraseña nueva
                </label>

                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                    required
                    autoComplete="new-password"
                />
            </div>

            <div>
                <label htmlFor="confirmPassword">
                    Repetir contraseña
                </label>

                <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                        setConfirmPassword(event.target.value)
                    }
                    required
                    autoComplete="new-password"
                />
            </div>

            {error && (
                <p role="alert">
                    {error}
                </p>
            )}

            {error && (
                <p>
                    <Link href="/recuperar-contrasena">
                        Solicitar un enlace nuevo
                    </Link>
                </p>
            )}

            <button
                type="submit"
                disabled={loading}
            >
                {loading
                    ? "Guardando..."
                    : "Guardar contraseña"}
            </button>
        </form>
    );
}
