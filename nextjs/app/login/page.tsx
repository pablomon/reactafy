"use client";

import { useContext, useState } from "react";
import { AuthContext } from "@/app/auth/AuthContext";

export default function LoginPage() {
    const { user, login, logout } = useContext(AuthContext);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        try {
            await login(username, password);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Error al iniciar sesión"
            );
        }
    }

    async function handleLogout() {
        try {
            await logout();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Error al cerrar sesión"
            );
        }
    }

    if (user) {
        return (
            <main>
                <h1>Ya has iniciado sesión</h1>

                <p>
                    Usuario: {user.name}
                </p>

                <p>
                    Email: {user.email}
                </p>

                <button
                    type="button"
                    onClick={handleLogout}
                >
                    Cerrar sesión
                </button>

                {error && (
                    <p>
                        {error}
                    </p>
                )}
            </main>
        );
    }

    return (
        <main>
            <h1>Iniciar sesión</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">
                        Usuario
                    </label>

                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(event) =>
                            setUsername(event.target.value)
                        }
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
                    />
                </div>

                <button type="submit">
                    Iniciar sesión
                </button>
            </form>

            {error && (
                <p>
                    {error}
                </p>
            )}
        </main>
    );
}