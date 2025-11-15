import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { pusherServer } from "@/lib/realtime/pusher-server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { conversationId, typing } = await req.json();
  await pusherServer.trigger(`private-conversation-${conversationId}`, typing ? "typing:start" : "typing:stop", {});
  return NextResponse.json({ ok: true });
}