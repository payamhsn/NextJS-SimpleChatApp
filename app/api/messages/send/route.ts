import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { pusherServer } from "@/lib/realtime/pusher-server";
import DOMPurify from "isomorphic-dompurify";
import { rateLimit } from "@/lib/security/rateLimit";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const ip = (req.headers as any).get?.("x-forwarded-for") ?? "local";
  if (!rateLimit(String(ip), 30, 10_000)) return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  const { conversationId, content, type } = await req.json();
  if (!conversationId || !content) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const conv = await prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true } });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const part = conv.participants.find(p => p.userId === me!.id);
  if (!part) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const sanitized = type === "text" ? DOMPurify.sanitize(content, { ALLOWED_TAGS: [] }) : content;
  const msg = await prisma.message.create({ data: { conversationId, senderId: me!.id, content: sanitized, type } });
  const sender = await prisma.user.findUnique({ where: { id: me!.id }, select: { id: true, displayName: true, username: true } });
  await pusherServer.trigger(`private-conversation-${conversationId}`, "message:new", { id: msg.id, content: sanitized, senderId: me!.id, sender, type, createdAt: msg.createdAt });
  return NextResponse.json({ ok: true, message: { ...msg, sender } });
}