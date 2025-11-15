"use client";
import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import Skeleton from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const { push, Toasts } = useToast();
  const router = useRouter();

  const load = async (query?: string) => {
    setLoading(true);
    const r = await fetch(`/api/users/list${query?`?q=${encodeURIComponent(query)}`:""}`);
    const j = await r.json();
    setUsers(j.users ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => load(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const sendRequest = async (u: any) => {
    const r = await fetch("/api/friends/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u.id }) });
    const j = await r.json();
    if (r.ok) push(`Request sent to ${u.displayName}`);
    else push(j.error ?? "Failed to send request");
  };
  const startChat = async (u: any) => {
    const r = await fetch("/api/conversations/create-or-get", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u.id }) });
    const j = await r.json();
    if (r.ok) router.push(`/chat/${j.conversationId}`);
    else push(j.error ?? "Failed to start chat");
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Users</h1>
      <div className="max-w-md">
        <Input placeholder="Search users" value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_,i)=>(<Skeleton key={i} className="h-12" />))}
        </div>
      ) : (
        <ul className="space-y-2">
          {users.map(u => (
            <li key={u.id} className="border rounded p-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={u.profilePictureUrl} name={u.displayName} />
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${isOnline(u.lastSeen)?"bg-green-500":"bg-gray-400"}`} />
                    {u.displayName}
                  </div>
                  <div className="text-sm text-gray-600">@{u.username}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {u.friendshipStatus === "accepted" && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Friends</span>}
                {u.friendshipStatus === "pending" && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Pending</span>}
                <Button variant="secondary" onClick={()=>startChat(u)}>Start Chat</Button>
                <Button onClick={()=>sendRequest(u)} disabled={u.friendshipStatus==="accepted" || u.friendshipStatus==="pending"}>Add Friend</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Toasts />
    </div>
  );
}

function isOnline(lastSeen?: Date | string | null) {
  if (!lastSeen) return false;
  const t = typeof lastSeen === "string" ? new Date(lastSeen).getTime() : (lastSeen as Date).getTime();
  return Date.now() - t < 30_000;
}