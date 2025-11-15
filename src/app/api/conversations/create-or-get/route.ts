import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "Missing user" }, { status: 400 });
  const other = await prisma.user.findUnique({ where: { id: userId } });
  if (!other) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const existing = await prisma.conversation.findFirst({
    where: { participants: { every: { OR: [{ userId: me!.id }, { userId: other.id }] } } },
    include: { participants: true },
  });
  if (existing) return NextResponse.json({ ok: true, conversationId: existing.id });
  const conv = await prisma.conversation.create({ data: { participants: { create: [{ userId: me!.id }, { userId: other.id }] } } });
  return NextResponse.json({ ok: true, conversationId: conv.id });
}