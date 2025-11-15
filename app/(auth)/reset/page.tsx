"use client";
import { useState } from "react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const requestReset = async () => {
    setMessage(null);
    const res = await fetch("/api/auth/request-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const json = await res.json();
    if (res.ok) {
      setToken(json.token ?? "");
      setMessage("Reset token generated (simulated). Use token below.");
    } else setMessage(json.error ?? "Failed");
  };

  const reset = async () => {
    setMessage(null);
    const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    const json = await res.json();
    setMessage(res.ok ? "Password updated" : json.error ?? "Failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Password reset</h1>
        {message && <p className="text-sm">{message}</p>}
        <Input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <Button className="w-full" onClick={requestReset}>Request reset</Button>
        <Input placeholder="Token" value={token} onChange={e=>setToken(e.target.value)} />
        <Input placeholder="New password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <Button className="w-full" onClick={reset}>Reset password</Button>
      </div>
    </div>
  );
}