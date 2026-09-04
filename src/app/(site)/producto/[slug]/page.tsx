import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductArt from "@/components/ProductArt";
import ProductCard from "@/components/ProductCard";
import BobaField from "@/components/BobaField";
import Reveal from "@/components/Reveal";
import AddToCart from "@/components/AddToCart";
import { getProductBySlug, getRelated } from "@/lib/product";
import { getExtras } from "@/lib/menu";
import { getSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  isoCurrency,
  productJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

/** Descripción de reserva cuando el producto no tiene una escrita. */
function describir(p: {
  name: string;
  description: string | null;
  categoryName: string;
  size: string | null;
}): string {
  if (p.description?.trim()) return p.description.trim();
  const tamano = p.size ? ` ${p.size}` : "";
  return `${p.name}${tamano}, de nuestra línea de ${p.categoryName}. Bebidas artesanales en Los Olivos, Lima. Pide por WhatsApp.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Producto no encontrado", robots: { index: false } };

  return buildMetadata({
    seo: p,
    fallbackTitle: `${p.name}${p.size ? ` ${p.size}` : ""} · ${p.categoryName}`,
    fallbackDescription: describir(p),
    path: `/producto/${p.slug}`,
    image: p.imageUrl,
    // Una bebida retirada conserva su página, pero no se ofrece en resultados
    noIndex: !p.active,
    type: "article",
  });
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [p, extras, settings] = await Promise.all([
    getProductBySlug(slug),
    getExtras(),
    getSettings(),
  ]);

  if (!p) notFound();

  const relacionados = await getRelated(p.categorySlug, p.id);
  const url = absoluteUrl(`/producto/${p.slug}`);
  const descripcion = describir(p);

  const ficha = productJsonLd({
    name: p.name,
    description: descripcion,
    image: p.imageUrl,
    url,
    price: p.price,
    currency: isoCurrency(settings.currency),
    available: p.active,
    category: p.categoryName,
    sku: p.slug,
  });

  const migas = breadcrumbJsonLd([
    { name: "Inicio", path: "/" },
    { name: "Carta", path: "/carta" },
    { name: p.name, path: `/producto/${p.slug}` },
  ]);

  return (
    <div className="grain relative min-h-dvh overflow-hidden bg-roa-900 px-5 pb-24 pt-32 sm:pt-40">
      {/* Datos estructurados: es lo que permite que el resultado de Google
          muestre el precio y si está disponible */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ficha) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(migas) }}
      />

      <div className="glow pointer-events-none absolute left-1/2 top-0 h-96 w-[36rem] -translate-x-1/2 opacity-40" />
      <BobaField count={12} />

      <div className="relative mx-auto max-w-5xl">
        {/* Migas visibles: la misma ruta que se le declara a Google */}
        <nav aria-label="Ruta" className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/" className="text-cream/45 transition hover:text-cream">
            Inicio
          </Link>
          <span className="text-cream/25">/</span>
          <Link href="/carta" className="text-cream/45 transition hover:text-cream">
            Carta
          </Link>
          <span className="text-cream/25">/</span>
          <span className="text-cream/80">{p.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-14">
          {/* Imagen */}
          <Reveal>
            <div className="grid place-items-center rounded-[2.5rem] border-2 border-ink bg-gradient-to-b from-roa-200 to-roa-100 p-8 shadow-[7px_7px_0_var(--color-ink)]">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={p.imageAlt?.trim() || `${p.name} — Roa Brew`}
                  className="h-64 w-auto object-contain"
                />
              ) : (
                <ProductArt
                  name={p.name}
                  categorySlug={p.categorySlug}
                  kind={p.categoryKind}
                  className="h-64"
                />
              )}
            </div>
          </Reveal>

          {/* Ficha */}
          <div>
            <Reveal delay={80}>
              <p className="font-hand text-2xl text-roa-300">
                {p.categoryTagline || p.categoryName}
              </p>
              <h1 className="mt-1 font-display text-[clamp(2.4rem,7vw,4rem)] leading-[0.9] text-cream">
                {p.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="font-display text-4xl text-mango">
                  {money(p.price, settings.currency)}
                </span>
                {p.size && (
                  <span className="rounded-full border-2 border-cream/25 px-3 py-1 text-sm font-bold text-cream/70">
                    {p.size}
                  </span>
                )}
                {!p.active && (
                  <span className="rounded-full border-2 border-cream/25 px-3 py-1 text-sm font-bold text-cream/50">
                    No disponible
                  </span>
                )}
              </div>

              <p className="mt-5 max-w-xl leading-relaxed text-cream/70">
                {descripcion}
              </p>

              {p.allyName && p.allySlug && (
                <p className="mt-4 text-sm text-cream/55">
                  De nuestra marca aliada{" "}
                  <Link
                    href={`/aliados/${p.allySlug}`}
                    className="font-bold text-roa-300 underline underline-offset-2"
                  >
                    {p.allyName}
                  </Link>
                </p>
              )}
            </Reveal>

            {p.active && (
              <Reveal delay={140}>
                <div className="mt-8">
                  <AddToCart
                    product={p}
                    extras={extras}
                    currency={settings.currency}
                  />
                </div>
              </Reveal>
            )}
          </div>
        </div>

        {/* Otras de la misma familia */}
        {relacionados.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-3xl text-cream">
              Más de {p.categoryName}
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relacionados.map((otro, i) => (
                <Reveal key={otro.id} delay={i * 70}>
                  <ProductCard
                    product={otro}
                    extras={extras}
                    currency={settings.currency}
                    index={i}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 text-center">
          <Link
            href="/carta"
            className="inline-block rounded-full border-2 border-cream px-7 py-4 font-display text-xl text-cream transition hover:bg-cream hover:text-roa-900"
          >
            Ver toda la carta
          </Link>
        </div>
      </div>
    </div>
  );
}
