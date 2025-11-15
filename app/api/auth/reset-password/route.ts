import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { resetSchema } from "@/lib/validations/auth";
import { hash } from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const { token, password } = parsed.data;
    const record = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    const userId = record.userId;
    const passwordHash = await hash(password, Number(process.env.BCRYPT_SALT_ROUNDS ?? 10));
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await prisma.passwordResetToken.delete({ where: { token } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}