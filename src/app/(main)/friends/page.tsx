"use client";
import { useEffect, useState } from "react";

export default function FriendsPage() {
  const [pending, setPending] = useState<any>(null);
  const [list, setList] = useState<any>(null);
  const [target, setTarget] = useState("");

  const load = async () => {
    const p = await fetch("/api/friends/pending").then(r=>r.json());
    const l = await fetch("/api/friends/list").then(r=>r.json());
    setPending(p); setList(l);
  };
  useEffect(() => { load(); }, []);

  const send = async () => {
    await fetch("/api/friends/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target }) });
    setTarget(""); load();
  };
  const respond = async (id: string, action: "accept"|"decline") => {
    await fetch("/api/friends/respond", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ friendshipId: id, action }) });
    load();
  };
  const remove = async (id: string) => {
    await fetch("/api/friends/remove", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetId: id }) });
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-md space-y-2">
        <h1 className="text-2xl font-semibold">Friends</h1>
        <div className="flex gap-2">
          <input className="flex-1 border rounded p-2" placeholder="Email or username" value={target} onChange={e=>setTarget(e.target.value)}/>
          <button className="bg-black text-white rounded px-3" onClick={send}>Send</button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-medium">Pending Requests</h2>
        <ul className="space-y-2">
          {pending?.requests?.map((r: any) => (
            <li key={r.id} className="border rounded p-2 flex justify-between">
              <span>{r.userId === r.friendId ? r.user.displayName : (r.userId ? r.user.displayName : r.friend.displayName)}</span>
              <div className="space-x-2">
                <button className="bg-green-600 text-white rounded px-2" onClick={()=>respond(r.id, "accept")}>Accept</button>
                <button className="bg-gray-600 text-white rounded px-2" onClick={()=>respond(r.id, "decline")}>Decline</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-medium">Friends List</h2>
        <ul className="space-y-2">
          {list?.friends?.map((f: any) => {
            const other = f.userId === f.friendId ? f.user : (f.userId ? f.friend : f.user);
            return (
              <li key={f.id} className="border rounded p-2 flex justify-between">
                <span>{other.displayName} (@{other.username})</span>
                <button className="bg-red-600 text-white rounded px-2" onClick={()=>remove(other.id)}>Remove</button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}