"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getPusherClient } from "@/lib/realtime/pusher-client";

type Message = { id: string; content: string; senderId: string; type: string; createdAt: string; isDeleted?: boolean; isEdited?: boolean };

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params?.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const res = await fetch(`/api/messages/list?conversationId=${conversationId}&limit=50`);
    const json = await res.json();
    if (res.ok) setMessages(json.messages.reverse());
  };

  useEffect(() => { load(); }, [conversationId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (typeof window !== "undefined" && Notification.permission === "default") Notification.requestPermission(); }, []);

  useEffect(() => {
    const p = getPusherClient();
    const ch = p.subscribe(`private-conversation-${conversationId}`);
    ch.bind("message:new", (m: Message) => { setMessages(prev => [...prev, m]); if (Notification.permission === "granted") new Notification("New message", { body: m.content }); });
    ch.bind("message:edit", (m: Partial<Message> & { id: string }) => setMessages(prev => prev.map(x => x.id===m.id ? { ...x, content: m.content ?? x.content, isEdited: true } : x)));
    ch.bind("message:delete", (m: { id: string }) => setMessages(prev => prev.map(x => x.id===m.id ? { ...x, isDeleted: true, content: "" } : x)));
    return () => { p.unsubscribe(`private-conversation-${conversationId}`); p.disconnect(); };
  }, [conversationId]);

  let typingTimer: any = null;
  const send = async () => {
    if (!content.trim()) return;
    const res = await fetch("/api/messages/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId, content, type: "text" }) });
    if (res.ok) setContent("");
  };
  const onChange = async (v: string) => {
    setContent(v);
    clearTimeout(typingTimer);
    await fetch("/api/messages/typing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId, typing: true }) });
    typingTimer = setTimeout(async () => { await fetch("/api/messages/typing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId, typing: false }) }); }, 1500);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(m => (
          <div key={m.id} className="max-w-lg border rounded p-2">
            <div className="text-sm text-gray-600">{new Date(m.createdAt).toLocaleTimeString()}</div>
            <div>{m.isDeleted ? <i>deleted</i> : m.content}</div>
            {m.isEdited && <div className="text-xs text-gray-500">edited</div>}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t flex gap-2">
        <input type="file" onChange={async e=>{
          const f = e.target.files?.[0];
          if (!f) return;
          const fd = new FormData(); fd.append("file", f);
          const r = await fetch("/api/uploads", { method: "POST", body: fd });
          const j = await r.json();
          if (r.ok) await fetch("/api/messages/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId, content: j.url, type: j.mime.startsWith("image/")?"image":(j.mime.startsWith("audio/")?"audio":"file") }) });
          (e.target as HTMLInputElement).value = "";
        }} />
        <input className="flex-1 border rounded p-2" value={content} onChange={e=>onChange(e.target.value)} placeholder="Type a message" />
        <button className="bg-black text-white rounded px-4" onClick={send}>Send</button>
      </div>
    </div>
  );
}