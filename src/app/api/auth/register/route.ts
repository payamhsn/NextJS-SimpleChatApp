import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { registerSchema } from "@/lib/validations/auth";
import { hash } from "bcrypt";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { email, password, username, displayName } = parsed.data;
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) return NextResponse.json({ error: "Email or username in use" }, { status: 409 });
    const passwordHash = await hash(password, Number(process.env.BCRYPT_SALT_ROUNDS ?? 10));
    const user = await prisma.user.create({
      data: { email, passwordHash, username, displayName },
    });
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, token, expiresAt: expires },
    });
    return NextResponse.json({ ok: true, token });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}