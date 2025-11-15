import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { requestResetSchema } from "@/lib/validations/auth";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestResetSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) return NextResponse.json({ ok: true });
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30);
    await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt: expires } });
    return NextResponse.json({ ok: true, token });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}