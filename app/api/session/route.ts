import { clientIp, mintToken, originOk } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!originOk(req)) {
    return new Response("Forbidden", { status: 403 });
  }
  return Response.json(
    { token: mintToken(clientIp(req)) },
    { headers: { "cache-control": "no-store" } },
  );
}
