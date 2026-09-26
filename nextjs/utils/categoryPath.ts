import type { CategoryPathItem } from "@/types/category";

// La URL pública de una categoría a partir de su ruta:
//   []                  → /tienda/
//   [Bebidas]           → /tienda/bebidas/
//   [Bebidas, Agua]     → /tienda/bebidas/agua/
// Único sitio donde se construye (página, migas de pan, chips, canonical…).
export function categoryPath(path: CategoryPathItem[]): string {
    return ["/tienda", ...path.map((item) => item.slug)].join("/") + "/";
}
