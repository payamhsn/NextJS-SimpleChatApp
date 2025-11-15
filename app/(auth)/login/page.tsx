"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations/auth";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { push, Toasts } = useToast();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const res = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    if (res?.ok) { push("Logged in"); router.push("/chat"); }
    else { setError("Invalid credentials or email not verified"); push("Login failed"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Login</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Input placeholder="Email" type="email" {...register("email")} />
        <Input placeholder="Password" type="password" {...register("password")} />
        <Button className="w-full" disabled={isSubmitting} type="submit">Sign In</Button>
        <div className="text-sm text-center">
          <a className="underline" href="/register">Create account</a>
        </div>
      </form>
      <Toasts />
    </div>
  );
}