"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  const uploadAvatar = async (file: File) => {
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/uploads", { method: "POST", body: fd });
    const j = await r.json();
    if (r.ok) setAvatar(j.url);
  };

  const save = async () => {
    await fetch("/api/users/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName, bio, profilePictureUrl: avatar }) });
    router.push("/profile");
  };

  return (
    <div className="p-6 space-y-4 max-w-md">
      <h1 className="text-2xl font-semibold">Edit Profile</h1>
      <input className="w-full border rounded p-2" placeholder="Display name" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
      <textarea className="w-full border rounded p-2" placeholder="Bio" value={bio} onChange={e=>setBio(e.target.value)} />
      <input type="file" onChange={e=>{ const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
      <button className="bg-black text-white rounded p-2" onClick={save}>Save</button>
    </div>
  );
}