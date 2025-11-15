import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const list = await prisma.friendship.findMany({
    where: { status: "pending", OR: [{ userId: me!.id }, { friendId: me!.id }] },
    include: { user: true, friend: true },
  });
  return NextResponse.json({ ok: true, requests: list });
}