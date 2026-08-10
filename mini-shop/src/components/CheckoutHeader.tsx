interface CheckoutHeaderProps {
  storeHref: string
}

export function CheckoutHeader({
  storeHref,
}: CheckoutHeaderProps) {
  return (
    <header>
      <a
        href={storeHref}
        aria-label="Ir a la tienda Aguafy"
      >
        Aguafy
      </a>

      <a href={storeHref}>
        ← Volver a la tienda
      </a>
    </header>
  )
}
