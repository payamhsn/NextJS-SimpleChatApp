import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return session.user as any;
}