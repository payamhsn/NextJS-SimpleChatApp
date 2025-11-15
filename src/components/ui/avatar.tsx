import Image from "next/image";

export default function Avatar({ src, name, size = 32 }: { src?: string; name: string; size?: number }) {
  if (src) return <Image src={src} alt={name} width={size} height={size} className="rounded-full" />;
  const initials = name.split(" ").map(s=>s[0]).join("").slice(0,2).toUpperCase();
  return <div className="rounded-full bg-gray-300 text-gray-700 flex items-center justify-center" style={{ width: size, height: size }}>{initials}</div>;
}