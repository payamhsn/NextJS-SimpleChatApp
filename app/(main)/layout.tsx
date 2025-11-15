import NavBar from "@/components/layout/NavBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-1 container mx-auto px-4">{children}</div>
    </div>
  );
}