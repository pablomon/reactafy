type OrderPageProps = {
    params: Promise<{
        id: string;
    }>;

    searchParams: Promise<{
        total?: string;
        tax?: string;
        items?: string;
        currency?: string;
    }>;
};

export default async function OrderPage(props: OrderPageProps) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    return (
        <main>
            <h1>Pedido completado</h1>
            <p>
            Pedido: #{params.id}
            </p>
            <p>
                Artículos: {searchParams.items}
            </p>

            <p>
                IVA: {searchParams.tax}{" "}
                {searchParams.currency}
            </p>

            <p>
                Total: {searchParams.total}{" "}
                {searchParams.currency}
            </p>
        </main>
    );
}