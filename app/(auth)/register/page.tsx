"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type FormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { push, Toasts } = useToast();
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setInfo(null);
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Failed to register"); return; }
    setInfo("Verification token generated.");
    await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: json.token }) });
    push("Account created. You can login now.");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Register</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {info && <p className="text-green-600 text-sm">{info}</p>}
        <Input placeholder="Email" type="email" {...register("email")} />
        <Input placeholder="Username" {...register("username")} />
        <Input placeholder="Display name" {...register("displayName")} />
        <Input placeholder="Password" type="password" {...register("password")} />
        <Button className="w-full" disabled={isSubmitting} type="submit">Create Account</Button>
        <div className="text-sm text-center">
          <a className="underline" href="/login">Back to login</a>
        </div>
      </form>
      <Toasts />
    </div>
  );
}