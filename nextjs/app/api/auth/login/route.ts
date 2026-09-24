import { cookies } from "next/headers";

import {
    readJson,
    startSession,
    WordPressAuthError,
} from "@/services/wordpressAuth";

export async function POST(request: Request) {
    const body = await readJson(request);

    const username =
        typeof body.username === "string" ? body.username.trim() : "";

    const password =
        typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
        return Response.json(
            { message: "Introduce usuario y contraseña." },
            { status: 400 }
        );
    }

    try {
        const user = await startSession(username, password);

        const cookieStore = await cookies();

        cookieStore.delete("cartToken");

        return Response.json(user);
    } catch (error) {
        if (error instanceof WordPressAuthError) {
            return Response.json(
                { code: error.code, message: error.message },
                { status: error.status }
            );
        }

        throw error;
    }
}
