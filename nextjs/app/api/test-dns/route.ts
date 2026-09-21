import dns from "node:dns/promises";

export async function GET() {
    const ipv4 = await dns.lookup(
        "staging.aguafy.com",
        { family: 4 }
    );

    const ipv6 = await dns.lookup(
        "staging.aguafy.com",
        { family: 6 }
    );

    return Response.json({
        ipv4,
        ipv6,
    });
}