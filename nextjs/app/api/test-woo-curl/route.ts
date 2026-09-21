import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function GET() {
    const { stdout, stderr } = await execAsync(
        `curl -s -o /dev/null \
        -w 'dns=%{time_namelookup}\\nconnect=%{time_connect}\\ntls=%{time_appconnect}\\nstarttransfer=%{time_starttransfer}\\ntotal=%{time_total}\\n' \
        https://staging.aguafy.com/wp-json/wc/store/v1/cart`
    );

    console.log(stdout);

    return Response.json({
        result: stdout,
        error: stderr,
    });
}