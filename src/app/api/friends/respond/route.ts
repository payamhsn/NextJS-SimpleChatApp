import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const { friendshipId, action } = await req.json(); // action: accept|decline
  const fr = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!fr || (fr.userId !== me!.id && fr.friendId !== me!.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const status = action === "accept" ? "accepted" : "declined";
  await prisma.friendship.update({ where: { id: friendshipId }, data: { status, actionUserId: me!.id } });
  return NextResponse.json({ ok: true });
}