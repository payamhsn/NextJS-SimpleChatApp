import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import Image from "next/image";
import Link from "next/link";

export default async function MyProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return <div className="p-6">Unauthorized</div>;
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">My Profile</h1>
      <div className="flex items-center gap-4">
        {me?.profilePictureUrl && <Image src={me.profilePictureUrl} alt="avatar" width={64} height={64} className="rounded-full"/>}
        <div>
          <div className="font-medium">{me?.displayName} (@{me?.username})</div>
          <div className="text-sm text-gray-600">{me?.bio}</div>
        </div>
      </div>
      <Link className="text-blue-600" href="/profile/edit">Edit Profile</Link>
    </div>
  );
}