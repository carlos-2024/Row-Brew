import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import { deleteProduct, toggleProduct } from "@/app/admin/actions";
import {
  AdminHeader,
  Button,
  EmptyState,
  LinkButton,
  Panel,
} from "@/components/admin/ui";
import CupArt from "@/components/CupArt";
import { CategoryIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const settings = await getSettings();

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { position: "asc" } }),
    prisma.product.findMany({
      where: cat ? { category: { slug: cat } } : undefined,
      orderBy: [{ category: { position: "asc" } }, { position: "asc" }],
      include: { category: true },
    }),
  ]);

  return (
    <>
      <AdminHeader
        kicker="catálogo"
        title="Productos"
        action={<LinkButton href="/admin/productos/nuevo">+ Nueva bebida</LinkButton>}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/productos"
          className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
            !cat
              ? "border-ink bg-cream text-ink"
              : "border-cream/20 text-cream/60 hover:border-cream hover:text-cream"
          }`}
        >
          Todas ({products.length})
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/admin/productos?cat=${c.slug}`}
            className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
              cat === c.slug
                ? "border-ink bg-roa-500 text-cream"
                : "border-cream/20 text-cream/60 hover:border-cream hover:text-cream"
            }`}
          >
            <CategoryIcon slug={c.slug} className="h-4 w-4" />
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No hay productos"
          text="Crea tu primera bebida o corre el seed para cargar la carta completa."
          action={<LinkButton href="/admin/productos/nuevo">+ Nueva bebida</LinkButton>}
        />
      ) : (
        <Panel className="!p-0">
          <ul className="divide-y divide-cream/8">
            {products.map((product) => (
              <li
                key={product.id}
                className={`flex flex-wrap items-center gap-4 p-4 transition hover:bg-roa-950/60 ${
                  product.active ? "" : "opacity-45"
                }`}
              >
                <div className="grid h-16 w-12 shrink-0 place-items-center rounded-xl bg-roa-950">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="h-14 w-full object-contain"
                    />
                  ) : (
                    <CupArt
                      name={product.name}
                      categorySlug={product.category.slug}
                      className="h-14"
                      animated={false}
                    />
                  )}
                </div>

                <div className="min-w-[12rem] flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-bold text-cream">
                    {product.name}
                    {product.badge === "nuevo" && (
                      <span className="rounded-full bg-mango px-2 py-0.5 text-[10px] font-black text-ink">
                        NUEVO
                      </span>
                    )}
                    {product.badge === "estrella" && (
                      <span className="rounded-full bg-grape px-2 py-0.5 text-[10px] font-black text-ink">
                        ★ TOP
                      </span>
                    )}
                    {product.featured && (
                      <span className="rounded-full border border-roa-400 px-2 py-0.5 text-[10px] font-black text-roa-300">
                        DESTACADO
                      </span>
                    )}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-cream/40">
                    <CategoryIcon slug={product.category.slug} className="h-3.5 w-3.5" />
                    {product.category.name}
                    {product.size ? ` · ${product.size}` : ""}
                  </p>
                </div>

                <span className="font-display text-2xl text-roa-300">
                  {money(product.price, settings.currency)}
                </span>

                <div className="flex items-center gap-2">
                  <form action={toggleProduct}>
                    <input type="hidden" name="id" value={product.id} />
                    <Button variant="ghost" className="!px-4 !py-2 !text-sm">
                      {product.active ? "Ocultar" : "Mostrar"}
                    </Button>
                  </form>
                  <LinkButton href={`/admin/productos/${product.id}`} variant="ghost">
                    Editar
                  </LinkButton>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={product.id} />
                    <Button variant="danger" className="!px-4 !py-2 !text-sm">
                      ✕
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}
