import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const { conversationId, archived } = await req.json();
  await prisma.conversationParticipant.updateMany({ where: { conversationId, userId: me!.id }, data: { isArchived: !!archived } });
  return NextResponse.json({ ok: true });
}