import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import {
  saveAlly,
  deleteAlly,
  addAllyImage,
  deleteAllyImage,
} from "@/app/admin/actions";
import {
  AdminHeader,
  Button,
  Field,
  LinkButton,
  Panel,
  Toggle,
  inputClass,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AliadosPage() {
  const [allies, settings] = await Promise.all([
    prisma.ally.findMany({
      orderBy: { position: "asc" },
      include: {
        images: { orderBy: { position: "asc" } },
        products: { orderBy: { position: "asc" } },
      },
    }),
    getSettings(),
  ]);

  return (
    <>
      <AdminHeader kicker="marcas" title="Nuestros aliados" />

      <p className="-mt-4 mb-6 max-w-3xl text-sm text-cream/45">
        Cada aliado tiene su historia, su galería y sus productos. Los productos
        se crean desde <strong>Productos</strong> eligiendo la marca en el campo
        “Marca aliada”: esos no salen en la carta, solo en esta sección, pero se
        compran por el mismo carrito.
      </p>

      <div className="grid gap-6 xl:grid-cols-[1fr_21rem]">
        <div className="space-y-5">
          {allies.map((ally) => (
            <Panel key={ally.id} className={ally.active ? "" : "opacity-50"}>
              {/* Datos */}
              <form action={saveAlly} className="grid gap-4 sm:grid-cols-6">
                <input type="hidden" name="id" value={ally.id} />

                <Field label="Nombre" className="sm:col-span-4">
                  <input name="name" defaultValue={ally.name} className={inputClass} />
                </Field>

                <Field label="Orden" className="sm:col-span-2">
                  <input
                    name="position"
                    type="number"
                    defaultValue={ally.position}
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Texto de la tarjeta"
                  className="sm:col-span-6"
                  hint="Es lo que se lee en el inicio, bajo el nombre de la marca."
                >
                  <input
                    name="tagline"
                    defaultValue={ally.tagline ?? ""}
                    placeholder="Matcha ceremonial de Shizuoka, Japón"
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Imagen de la tarjeta"
                  className="sm:col-span-6"
                  hint="La foto grande que se ve en el inicio. Apaisada se ve mejor."
                >
                  <input
                    name="coverUrl"
                    defaultValue={ally.coverUrl ?? ""}
                    placeholder="/img/kaori-portada.jpg"
                    className={inputClass}
                  />
                </Field>

                <Field label="Titular de la historia" className="sm:col-span-6">
                  <input
                    name="storyTitle"
                    defaultValue={ally.storyTitle ?? ""}
                    placeholder="Desde la Prefectura de Shizuoka hasta tu taza"
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Historia"
                  className="sm:col-span-6"
                  hint="Deja una línea en blanco entre párrafos para separarlos."
                >
                  <textarea
                    name="story"
                    rows={8}
                    defaultValue={ally.story ?? ""}
                    className={`${inputClass} resize-y`}
                  />
                </Field>

                <Field label="URL del logo" className="sm:col-span-4">
                  <input
                    name="logoUrl"
                    defaultValue={ally.logoUrl ?? ""}
                    placeholder="/img/matcha-kaori.png"
                    className={inputClass}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Toggle name="active" label="Visible" defaultChecked={ally.active} />
                </div>

                {/* Solo para administración: nada de esto lo ve el cliente */}
                <details className="sm:col-span-6 rounded-xl border-2 border-cream/12 p-3">
                  <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-cream/45">
                    SEO
                  </summary>
                
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label="Meta title" className="sm:col-span-2" hint="hasta 60 caracteres">
                      <input
                        name="metaTitle"
                        defaultValue={ally.metaTitle ?? ""}
                        maxLength={70}
                        className={inputClass}
                      />
                    </Field>
                    <Field
                      label="Meta description"
                      className="sm:col-span-2"
                      hint="hasta 155 caracteres"
                    >
                      <textarea
                        name="metaDescription"
                        defaultValue={ally.metaDescription ?? ""}
                        rows={2}
                        maxLength={200}
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                    <Field label="SEO keywords" hint="separadas por coma">
                      <input
                        name="seoKeywords"
                        defaultValue={ally.seoKeywords ?? ""}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Alt text de imagen">
                      <input
                        name="imageAlt"
                        defaultValue={ally.imageAlt ?? ""}
                        className={inputClass}
                      />
                    </Field>
                    <p className="sm:col-span-2 text-xs text-cream/35">
                      URL: /aliados/{ally.slug}
                    </p>
                  </div>
                </details>

                <div className="sm:col-span-6">
                  <Button variant="primary">Guardar aliado</Button>
                </div>
              </form>

              {/* Galería */}
              <div className="mt-5 border-t-2 border-cream/8 pt-5">
                <p className="mb-3 text-sm font-bold text-roa-300">
                  Galería ({ally.images.length})
                </p>

                {ally.images.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-3">
                    {ally.images.map((img) => (
                      <div key={img.id} className="w-28">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.caption ?? ""}
                          className="aspect-square w-full rounded-xl border-2 border-cream/12 object-cover"
                        />
                        <form action={deleteAllyImage} className="mt-1">
                          <input type="hidden" name="id" value={img.id} />
                          <Button
                            variant="danger"
                            className="!w-full !px-2 !py-1 !text-[11px]"
                          >
                            Quitar
                          </Button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}

                <form action={addAllyImage} className="flex flex-wrap gap-2">
                  <input type="hidden" name="allyId" value={ally.id} />
                  <input
                    name="url"
                    required
                    placeholder="/img/kaori-1.jpg  o  https://…"
                    className={`${inputClass} flex-1 min-w-[14rem]`}
                  />
                  <input
                    name="caption"
                    placeholder="Pie de foto (opcional)"
                    className={`${inputClass} w-48`}
                  />
                  <Button variant="ghost">Agregar foto</Button>
                </form>
              </div>

              {/* Productos */}
              <div className="mt-5 border-t-2 border-cream/8 pt-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-bold text-roa-300">
                    Productos ({ally.products.length})
                  </p>
                  <LinkButton href="/admin/productos/nuevo" variant="ghost">
                    + Agregar producto
                  </LinkButton>
                </div>

                {ally.products.length === 0 ? (
                  <p className="text-sm text-cream/40">
                    Sin productos todavía. Créalos en Productos y elige “{ally.name}”
                    en el campo Marca aliada.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {ally.products.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/admin/productos/${p.id}`}
                          className={`flex items-center justify-between gap-3 rounded-xl bg-roa-950 px-4 py-2.5 transition hover:bg-roa-900 ${
                            p.active ? "" : "opacity-45"
                          }`}
                        >
                          <span className="truncate text-sm text-cream/85">
                            {p.name}
                          </span>
                          <span className="shrink-0 font-display text-lg text-roa-300">
                            {money(p.price, settings.currency)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <form action={deleteAlly} className="mt-5 border-t-2 border-cream/8 pt-4">
                <input type="hidden" name="id" value={ally.id} />
                <Button variant="danger" className="!px-4 !py-2 !text-sm">
                  Eliminar aliado
                </Button>
              </form>
            </Panel>
          ))}

          {allies.length === 0 && (
            <Panel>
              <p className="py-8 text-center text-cream/45">
                Aún no hay aliados. Crea el primero con el formulario de la derecha.
              </p>
            </Panel>
          )}
        </div>

        {/* Nuevo aliado */}
        <Panel title="Nuevo aliado" className="h-fit xl:sticky xl:top-6">
          <form action={saveAlly} className="space-y-4">
            <Field label="Nombre">
              <input
                name="name"
                required
                placeholder="Matcha Kaori"
                className={inputClass}
              />
            </Field>
            <Field label="Texto de la tarjeta">
              <input
                name="tagline"
                placeholder="Matcha ceremonial de Shizuoka"
                className={inputClass}
              />
            </Field>
            <Field label="Imagen de la tarjeta">
              <input name="coverUrl" placeholder="/img/…" className={inputClass} />
            </Field>
            <Field label="Titular de la historia">
              <input name="storyTitle" className={inputClass} />
            </Field>
            <Field label="Historia">
              <textarea name="story" rows={5} className={`${inputClass} resize-none`} />
            </Field>
            <Field label="URL del logo">
              <input name="logoUrl" className={inputClass} />
            </Field>
            <input type="hidden" name="position" value={allies.length} />
            <Toggle name="active" label="Visible" defaultChecked />
            <Button variant="primary" className="w-full">
              Crear aliado
            </Button>
          </form>
        </Panel>
      </div>
    </>
  );
}
