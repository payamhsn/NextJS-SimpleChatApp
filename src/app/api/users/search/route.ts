import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ users: [] });
  const users = await prisma.user.findMany({ where: { OR: [{ email: { contains: q } }, { username: { contains: q } }] }, take: 10 });
  return NextResponse.json({ users });
}