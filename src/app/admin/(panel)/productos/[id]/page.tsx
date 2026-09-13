import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import { AdminHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, allies, subcategories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({
      orderBy: { position: "asc" },
      select: { id: true, name: true, slug: true, emoji: true, kind: true },
    }),
    prisma.ally.findMany({
      orderBy: { position: "asc" },
      select: { id: true, name: true },
    }),
    prisma.subcategory.findMany({
      where: { active: true },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <>
      <AdminHeader kicker="catálogo" title={product.name} />
      <ProductForm categories={categories} subcategories={subcategories} allies={allies} product={product} />
    </>
  );
}
