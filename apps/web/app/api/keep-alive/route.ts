import { prisma } from "@bloom/db";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error("Keep alive failed", e);
    return Response.json({ ok: false });
  }
}