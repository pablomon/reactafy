"use client";

import { useState } from "react";

export default function LoginPage() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const response = await fetch(
            "/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            }
        );

        const data = await response.json();

        console.log(data);
    }

    return (
        <main>
            <h1>Iniciar sesión</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    value={username}
                    onChange={(event) =>
                        setUsername(event.target.value)
                    }
                />

                <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                />

                <button type="submit">
                    Entrar
                </button>

            </form>
        </main>
    );
}