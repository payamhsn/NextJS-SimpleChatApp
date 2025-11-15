import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { Suspense } from "react";

export default async function ChatListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return <div className="p-6">Unauthorized</div>;
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: me!.id } } },
    orderBy: { updatedAt: "desc" },
    include: { participants: { include: { user: true } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Chats</h1>
      <div className="max-w-md"><input className="w-full border rounded p-2" placeholder="Search" /></div>
      <ul className="space-y-2">
        {conversations.map(c => {
          const others = c.participants.filter(p=>p.userId!==me!.id).map(p=>p.user.displayName).join(", ");
          const last = c.messages[0]?.content ?? "";
          return (
            <li key={c.id} className="border rounded p-3 flex justify-between">
              <div>
                <div className="font-medium">{others || "You"}</div>
                <div className="text-sm text-gray-600">{last}</div>
              </div>
              <Link className="text-blue-600" href={`/chat/${c.id}`}>Open</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}