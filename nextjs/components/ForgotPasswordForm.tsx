"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Mensaje de confirmación. Es el mismo exista o no la cuenta.
    const [sentMessage, setSentMessage] =
        useState<string | null>(null);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError(null);
        setLoading(true);

        try {
            const response = await fetch(
                "/api/auth/password/forgot",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ??
                    "No se pudo enviar el email."
                );
                return;
            }

            setSentMessage(data.message);
        } catch {
            setError(
                "No se pudo conectar con el servidor."
            );
        } finally {
            setLoading(false);
        }
    }

    if (sentMessage) {
        return (
            <div role="status">
                <p>{sentMessage}</p>

                <Link href="/login">
                    Volver a iniciar sesión
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">
                    Email
                </label>

                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    required
                    autoComplete="email"
                />
            </div>

            {error && (
                <p role="alert">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={loading}
            >
                {loading
                    ? "Enviando..."
                    : "Enviar enlace"}
            </button>
        </form>
    );
}
