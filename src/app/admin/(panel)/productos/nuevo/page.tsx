import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import { AdminHeader, EmptyState, LinkButton } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const [categories, allies] = await Promise.all([
    prisma.category.findMany({
      orderBy: { position: "asc" },
      select: { id: true, name: true, slug: true, emoji: true },
    }),
    prisma.ally.findMany({
      orderBy: { position: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <>
      <AdminHeader kicker="catálogo" title="Nuevo producto" />
      {categories.length === 0 ? (
        <EmptyState
          title="Primero crea una categoría"
          text="Cada producto necesita una familia. La familia decide si es bebida, comida o postre, y con eso cómo se dibuja en la carta."
          action={<LinkButton href="/admin/categorias">Ir a categorías</LinkButton>}
        />
      ) : (
        <ProductForm categories={categories} allies={allies} />
      )}
    </>
  );
}
