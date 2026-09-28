import { headers } from "next/headers";

// URL del login con vuelta a la página actual: /login/?next=/zona-de-usuario/pedidos/
// La ruta la deja proxy.ts en la cabecera x-pathname (un Server
// Component no conoce su URL). Fuera de la zona de usuario no existe
// y se va al login sin más.
export async function loginUrl(): Promise<string> {
    const path = (await headers()).get("x-pathname");

    return path ? `/login/?next=${encodeURIComponent(path)}` : "/login/";
}
