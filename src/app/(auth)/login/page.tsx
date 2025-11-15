"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations/auth";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const res = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    if (res?.ok) router.push("/chat");
    else setError("Invalid credentials or email not verified");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Login</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input className="w-full border rounded p-2" placeholder="Email" type="email" {...register("email")}/>
        <input className="w-full border rounded p-2" placeholder="Password" type="password" {...register("password")}/>
        <button className="w-full bg-black text-white rounded p-2 disabled:opacity-50" disabled={isSubmitting} type="submit">Sign In</button>
        <div className="text-sm text-center">
          <a className="underline" href="/register">Create account</a>
        </div>
      </form>
    </div>
  );
}