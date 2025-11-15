import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export default async function ChatListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return <div className="p-6">Unauthorized</div>;
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const conversations = await prisma.conversation.findMany({ where: { participants: { some: { userId: me!.id } } }, orderBy: { updatedAt: "desc" }, include: { participants: { include: { user: true } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } } });
  const unreadCounts = await Promise.all(conversations.map(async c => {
    const mePart = c.participants.find(p=>p.userId===me!.id);
    const lastReadAt = mePart?.lastReadAt ?? new Date(0);
    const count = await prisma.message.count({ where: { conversationId: c.id, createdAt: { gt: lastReadAt }, senderId: { not: me!.id }, isDeleted: false } });
    return { id: c.id, count };
  }));
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Chats</h1>
      <div className="max-w-md"><input className="w-full border rounded p-2" placeholder="Search" /></div>
      <ul className="space-y-2">
        {conversations.map(c => {
          const others = c.participants.filter(p=>p.userId!==me!.id).map(p=>p.user.displayName).join(", ");
          const last = c.messages[0]?.content ?? "";
          const unread = unreadCounts.find(u=>u.id===c.id)?.count ?? 0;
          return (
            <li key={c.id} className="border rounded p-3 flex justify-between">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${isOnline(c.participants.find(p=>p.userId!==me!.id)?.user.lastSeen)?"bg-green-500":"bg-gray-400"}`} />
                  {others || "You"}
                </div>
                <div className="text-sm text-gray-600">{last}</div>
              </div>
              <div className="flex items-center gap-3">
                {unread>0 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">{unread}</span>}
                <Link className="text-blue-600" href={`/chat/${c.id}`}>Open</Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function isOnline(lastSeen?: Date | string | null) {
  if (!lastSeen) return false;
  const t = typeof lastSeen === "string" ? new Date(lastSeen).getTime() : (lastSeen as Date).getTime();
  return Date.now() - t < 30_000;
}