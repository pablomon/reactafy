import { redirect } from "next/navigation";

// No hay página de resumen: /zona-de-usuario/ lleva directamente a los
// pedidos. (El layout ya ha comprobado la sesión antes de llegar aquí.)
export default function AccountHomePage() {
    redirect("/zona-de-usuario/pedidos/");
}
