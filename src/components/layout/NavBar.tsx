"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function NavBar() {
  const pathname = usePathname();
  const links = [
    { href: "/chat", label: "Chats" },
    { href: "/friends", label: "Friends" },
    { href: "/users", label: "Users" },
    { href: "/profile", label: "Profile" },
    { href: "/settings", label: "Settings" },
  ];
  return (
    <div className="flex items-center justify-between border-b px-4 py-2">
      <div className="flex items-center gap-4">
        <Link href="/chat" className="font-semibold">Private Chat</Link>
        <div className="hidden md:flex items-center gap-2">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`px-3 py-1 rounded ${pathname===l.href?"bg-gray-200":"hover:bg-gray-100"}`}>{l.label}</Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={()=>{
          const html = document.documentElement;
          html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
        }}>Theme</Button>
        <Button onClick={()=>signOut({ callbackUrl: "/login" })}>Logout</Button>
      </div>
    </div>
  );
}