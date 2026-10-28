// Iconos de las tres guías (por slug de categoría). Sin libraría de iconos:
// son tres dibujos de línea, de 45 px.
const common = {
    width: 45,
    height: 45,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
    "aria-hidden": true,
};

const ICONS: Record<string, React.ReactNode> = {
    "operacion-inteligente": (
        <svg {...common}>
            <path d="M6 8h10v28l-5 6-5-6V8ZM6 14h10M26 6h14v36H26V6ZM26 14h6M26 22h6M26 30h6" />
        </svg>
    ),
    "hospitalidad-premium": (
        <svg {...common}>
            <path d="m6 36 3-20 10 10 5-14 5 14 10-10 3 20H6ZM6 42h36" />
        </svg>
    ),
    "destras-de-la-operacion": (
        <svg {...common}>
            <path d="M4 10h24v24H4V10ZM28 18h9l7 8v8H28V18ZM12 34a4 4 0 1 0 0 .01M36 34a4 4 0 1 0 0 .01" />
        </svg>
    ),
};

export default function GuideIcon({ slug }: { slug: string }) {
    return ICONS[slug] ?? null;
}
