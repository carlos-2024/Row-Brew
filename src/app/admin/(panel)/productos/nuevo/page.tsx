import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import { AdminHeader, EmptyState, LinkButton } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    select: { id: true, name: true, slug: true, emoji: true },
  });

  return (
    <>
      <AdminHeader kicker="catálogo" title="Nueva bebida" />
      {categories.length === 0 ? (
        <EmptyState
          title="Primero crea una categoría"
          text="Cada bebida necesita pertenecer a una familia (Sparkling Tea, Matcha, Cold Brew…)."
          action={<LinkButton href="/admin/categorias">Ir a categorías</LinkButton>}
        />
      ) : (
        <ProductForm categories={categories} />
      )}
    </>
  );
}
