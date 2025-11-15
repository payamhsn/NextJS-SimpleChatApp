import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { target } = await req.json(); // target can be email or username
  const other = await prisma.user.findFirst({ where: { OR: [{ email: target }, { username: target }] } });
  if (!other || other.id === me.id) return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  const existing = await prisma.friendship.findFirst({ where: { OR: [
    { userId: me.id, friendId: other.id }, { userId: other.id, friendId: me.id }
  ] } });
  if (existing) return NextResponse.json({ error: "Already requested or friends" }, { status: 400 });
  const fr = await prisma.friendship.create({ data: { userId: me.id, friendId: other.id, status: "pending", actionUserId: me.id } });
  return NextResponse.json({ ok: true, friendshipId: fr.id });
}