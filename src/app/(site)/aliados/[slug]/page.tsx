import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import BobaField from "@/components/BobaField";
import Reveal from "@/components/Reveal";
import Leaf from "@/components/Leaf";
import { getAllies } from "@/lib/allies";
import { getExtras } from "@/lib/menu";
import { getSettings } from "@/lib/settings";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function buscarAliado(slug: string) {
  const allies = await getAllies();
  return allies.find((a) => a.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ally = await buscarAliado(slug);
  if (!ally) return { title: "Aliado no encontrado" };

  return buildMetadata({
    seo: ally,
    fallbackTitle: ally.name,
    fallbackDescription:
      ally.tagline ?? `Conoce a ${ally.name}, una de las marcas detrás de Roa Brew.`,
    path: `/aliados/${ally.slug}`,
    image: ally.coverUrl ?? ally.logoUrl,
    type: "article",
  });
}

export default async function AliadoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [ally, extras, settings] = await Promise.all([
    buscarAliado(slug),
    getExtras(),
    getSettings(),
  ]);

  if (!ally) notFound();

  const parrafos = (ally.story ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Brand y no Organization: es una marca cuyos productos vendemos, no la
  // empresa que atiende. Google las trata distinto.
  const marca = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: ally.name,
    url: absoluteUrl(`/aliados/${ally.slug}`),
    ...(ally.logoUrl ? { logo: ally.logoUrl } : {}),
    ...(ally.coverUrl ? { image: [ally.coverUrl] } : {}),
    ...(ally.tagline ? { description: ally.tagline } : {}),
  };

  const migas = breadcrumbJsonLd([
    { name: "Inicio", path: "/" },
    { name: ally.name, path: `/aliados/${ally.slug}` },
  ]);

  return (
    <div className="bg-roa-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(marca) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(migas) }}
      />
      {/* Cabecera */}
      <header className="grain relative overflow-hidden bg-roa-800 px-5 pb-16 pt-40 text-cream sm:pt-48">
        <div className="glow pointer-events-none absolute left-1/4 top-0 h-96 w-[34rem] opacity-40" />
        <Leaf className="pointer-events-none absolute -right-20 top-24 h-72 -rotate-[30deg] text-roa-700/40" />
        <BobaField count={12} />

        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/#aliados"
            className="inline-flex items-center gap-2 text-sm font-bold text-cream/55 transition hover:text-cream"
          >
            <span aria-hidden>←</span> Nuestros aliados
          </Link>

          <div className="mt-6 flex flex-wrap items-end gap-6">
            {ally.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ally.logoUrl}
                alt={ally.name}
                className="h-24 w-24 rounded-3xl border-2 border-ink bg-cream object-cover shadow-[5px_5px_0_var(--color-ink)]"
              />
            )}
            <div>
              <p className="font-hand text-3xl text-roa-300">conoce lo que tomas</p>
              <h1 className="mt-1 font-display text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.88]">
                {ally.name}
              </h1>
            </div>
          </div>

          {ally.tagline && (
            <p className="mt-5 max-w-xl text-lg text-cream/75">{ally.tagline}</p>
          )}
        </div>
      </header>

      {/* Historia */}
      {parrafos.length > 0 && (
        <section className="grain relative bg-cream py-20 text-ink">
          <div className="mx-auto max-w-7xl px-5">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
              <Reveal>
                <p className="font-hand text-3xl text-roa-500">su historia</p>
                {ally.storyTitle && (
                  <h2 className="mt-1 font-display text-[clamp(2rem,5vw,3.2rem)] leading-[0.95]">
                    {ally.storyTitle}
                  </h2>
                )}
              </Reveal>

              <Reveal delay={120}>
                <div className="space-y-4 text-lg leading-relaxed text-ink/70">
                  {parrafos.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Galería */}
            {ally.images.length > 0 && (
              <Reveal delay={160}>
                <div className="mt-16">
                  <p className="mb-5 font-hand text-3xl text-roa-500">galería</p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {ally.images.map((img) => (
                      <figure
                        key={img.id}
                        className="overflow-hidden rounded-[1.5rem] border-2 border-ink bg-white/60 shadow-[4px_4px_0_var(--color-ink)]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.caption ?? ally.name}
                          loading="lazy"
                          className="aspect-square w-full object-cover transition duration-500 hover:scale-105"
                        />
                        {img.caption && (
                          <figcaption className="px-3 py-2 text-xs text-ink/55">
                            {img.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* Productos */}
      <section className="grain relative overflow-hidden bg-roa-900 py-20">
        <BobaField count={10} />
        <div className="relative mx-auto max-w-7xl px-5">
          <Reveal className="mb-10">
            <p className="font-hand text-3xl text-roa-300">llévatelo a casa</p>
            <h2 className="mt-1 font-display text-[clamp(2rem,5.5vw,3.5rem)] leading-[0.9] text-cream">
              Sus productos
            </h2>
          </Reveal>

          {ally.products.length === 0 ? (
            <p className="rounded-3xl border-2 border-dashed border-cream/15 py-16 text-center text-cream/45">
              Pronto vas a poder llevarte sus productos desde acá.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ally.products.map((p, i) => (
                <Reveal key={p.id} delay={i * 70}>
                  <ProductCard
                    product={p}
                    extras={extras}
                    currency={settings.currency}
                    index={i}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
