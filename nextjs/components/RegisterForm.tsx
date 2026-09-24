"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function RegisterForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // La cuenta se creó pero no se pudo abrir sesión (respuesta 202).
    const [createdMessage, setCreatedMessage] =
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
                "/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ??
                    "No se pudo crear la cuenta."
                );
                return;
            }

            if (response.status === 202) {
                setCreatedMessage(
                    data.message ??
                    "Cuenta creada. Inicia sesión para continuar."
                );
                return;
            }

            // Temporalmente.
            // Después decidiremos dónde redirigir.
            window.location.href = "/";

        } catch {
            setError(
                "No se pudo conectar con el servidor."
            );
        } finally {
            setLoading(false);
        }
    }

    if (createdMessage) {
        return (
            <div role="status">
                <p>{createdMessage}</p>

                <Link href="/login">
                    Iniciar sesión
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

            <div>
                <label htmlFor="password">
                    Contraseña
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

            <button
                type="submit"
                disabled={loading}
            >
                {loading
                    ? "Creando cuenta..."
                    : "Crear cuenta"}
            </button>
        </form>
    );
}