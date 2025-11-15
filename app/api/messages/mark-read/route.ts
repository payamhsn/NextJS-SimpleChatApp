import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { pusherServer } from "@/lib/realtime/pusher-server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const { messageId } = await req.json();
  const msg = await prisma.message.update({ where: { id: messageId }, data: { isRead: true, readAt: new Date() } });
  await prisma.conversationParticipant.updateMany({ where: { conversationId: msg.conversationId, userId: me!.id }, data: { lastReadAt: new Date() } });
  await pusherServer.trigger(`private-conversation-${msg.conversationId}`, "message:read", { id: msg.id, userId: me!.id });
  return NextResponse.json({ ok: true });
}