export function formatOrderStatus(
    status: string
) {
    switch (status) {
        case "pending":
            return "Pendiente";

        case "processing":
            return "Procesando";

        case "on-hold":
            return "En espera";

        case "completed":
            return "Completado";

        case "cancelled":
            return "Cancelado";

        case "refunded":
            return "Reembolsado";

        case "failed":
            return "Fallido";

        default:
            return status;
    }
}