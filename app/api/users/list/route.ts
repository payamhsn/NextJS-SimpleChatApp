import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const where = {
    id: { not: me!.id },
    ...(q ? { OR: [
      { email: { contains: q } },
      { username: { contains: q } },
      { displayName: { contains: q } },
    ] } : {}),
  };
  const users = await prisma.user.findMany({ where, orderBy: { displayName: "asc" }, take: 50 });
  const ids = users.map(u => u.id);
  const relations = await prisma.friendship.findMany({
    where: {
      OR: [
        { userId: me!.id, friendId: { in: ids } },
        { friendId: me!.id, userId: { in: ids } },
      ],
    },
  });
  const statusByOther: Record<string, string> = {};
  relations.forEach(r => {
    const otherId = r.userId === me!.id ? r.friendId : r.userId;
    statusByOther[otherId] = r.status;
  });
  const enriched = users.map(u => ({
    ...u,
    friendshipStatus: statusByOther[u.id] || null,
  }));
  return NextResponse.json({ users: enriched });
}