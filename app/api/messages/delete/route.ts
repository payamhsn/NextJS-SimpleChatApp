import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { pusherServer } from "@/lib/realtime/pusher-server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const { messageId, mode } = await req.json();
  const msg = await prisma.message.findUnique({ where: { id: messageId } });
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (mode === "everyone") {
    if (msg.senderId !== me!.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await prisma.message.update({ where: { id: messageId }, data: { isDeleted: true, content: "" } });
    await pusherServer.trigger(`private-conversation-${msg.conversationId}`, "message:delete", { id: msg.id, everyone: true });
  } else {
    await prisma.messageHide.upsert({ where: { messageId_userId: { messageId, userId: me!.id } }, update: {}, create: { messageId, userId: me!.id } });
  }
  return NextResponse.json({ ok: true });
}