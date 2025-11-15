"use client";
import { useEffect, useState } from "react";

export function useToast() {
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([]);
  const push = (text: string) => {
    const id = Date.now();
    setMessages(m => [...m, { id, text }]);
    setTimeout(() => setMessages(m => m.filter(x => x.id !== id)), 3000);
  };
  const Toasts = () => (
    <div className="fixed bottom-4 right-4 space-y-2">
      {messages.map(m => (
        <div key={m.id} className="rounded bg-black text-white px-3 py-2 text-sm shadow">{m.text}</div>
      ))}
    </div>
  );
  return { push, Toasts };
}