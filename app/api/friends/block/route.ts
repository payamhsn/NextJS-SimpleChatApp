import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const { targetId } = await req.json();
  const fr = await prisma.friendship.findFirst({ where: { OR: [ { userId: me!.id, friendId: targetId }, { userId: targetId, friendId: me!.id } ] } });
  if (fr) {
    await prisma.friendship.update({ where: { id: fr.id }, data: { status: "blocked", actionUserId: me!.id } });
  } else {
    await prisma.friendship.create({ data: { userId: me!.id, friendId: targetId, status: "blocked", actionUserId: me!.id } });
  }
  return NextResponse.json({ ok: true });
}