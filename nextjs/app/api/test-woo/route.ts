import dns from "node:dns/promises";

export async function GET() {
    const start = performance.now();

    const result = await dns.lookup("staging.aguafy.com");

    const dnsTime = Math.round(
        performance.now() - start
    );

    console.log("DNS:", result, dnsTime, "ms");

    return Response.json({
        result,
        dnsTime,
    });
}