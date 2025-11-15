import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { pusherServer } from "@/lib/realtime/pusher-server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const { messageId, content } = await req.json();
  const msg = await prisma.message.findUnique({ where: { id: messageId } });
  if (!msg || msg.senderId !== me!.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const upd = await prisma.message.update({ where: { id: messageId }, data: { content, isEdited: true } });
  await pusherServer.trigger(`private-conversation-${upd.conversationId}`, "message:edit", { id: upd.id, content });
  return NextResponse.json({ ok: true });
}