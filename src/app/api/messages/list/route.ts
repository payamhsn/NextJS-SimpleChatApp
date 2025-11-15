import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const conversationId = url.searchParams.get("conversationId");
  const cursor = url.searchParams.get("cursor");
  const take = Number(url.searchParams.get("limit") ?? 30);
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!conversationId) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const conv = await prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true } });
  if (!conv || !conv.participants.find(p=>p.userId===me!.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });
  const nextCursor = messages.length === take ? messages[messages.length-1].id : null;
  return NextResponse.json({ ok: true, messages, nextCursor });
}