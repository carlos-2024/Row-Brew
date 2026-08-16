import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const pendingCount = await prisma.order
    .count({ where: { status: "PENDIENTE" } })
    .catch(() => 0);

  return (
    <div className="min-h-dvh bg-roa-950 lg:flex">
      <AdminNav userName={session.name.split(" ")[0]} pendingCount={pendingCount} />
      <div className="flex-1 overflow-x-hidden px-4 py-6 lg:px-10 lg:py-10">
        {children}
      </div>
    </div>
  );
}
