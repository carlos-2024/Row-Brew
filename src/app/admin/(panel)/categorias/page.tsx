import { prisma } from "@/lib/prisma";
import {
  saveCategory,
  deleteCategory,
  saveSubcategory,
  deleteSubcategory,
} from "@/app/admin/actions";
import {
  AdminHeader,
  Button,
  Field,
  Panel,
  Toggle,
  THEME_OPTIONS,
  KIND_OPTIONS,
  inputClass,
} from "@/components/admin/ui";
import { CategoryIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const [categories, subcategories] = await Promise.all([
    prisma.category.findMany({
      orderBy: { position: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.subcategory.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: true } } },
    }),
  ]);

  return (
    <>
      <AdminHeader kicker="catálogo" title="Categorías" />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          {categories.map((cat) => (
            <Panel key={cat.id}>
              <form action={saveCategory} className="grid gap-4 sm:grid-cols-6">
                <input type="hidden" name="id" value={cat.id} />

                {/* El icono sale del slug, no de un emoji: así se ve igual
                    en cualquier equipo. Esto es solo la vista previa. */}
                <input type="hidden" name="emoji" value={cat.emoji} />
                <Field label="Icono" className="sm:col-span-1">
                  <div className="grid h-[46px] place-items-center rounded-xl border-2 border-cream/12 bg-roa-950 text-roa-300">
                    <CategoryIcon slug={cat.slug} className="h-6 w-6" />
                  </div>
                </Field>

                <Field label="Nombre" className="sm:col-span-3">
                  <input
                    name="name"
                    defaultValue={cat.name}
                    className={inputClass}
                  />
                </Field>

                <Field label="Orden" className="sm:col-span-1">
                  <input
                    name="position"
                    type="number"
                    defaultValue={cat.position}
                    className={inputClass}
                  />
                </Field>

                <Field label="Qué sirve" className="sm:col-span-1">
                  <select
                    name="kind"
                    defaultValue={cat.kind}
                    className={inputClass}
                  >
                    {KIND_OPTIONS.map((k) => (
                      <option key={k.value} value={k.value}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Tema" className="sm:col-span-1">
                  <select
                    name="theme"
                    defaultValue={cat.theme}
                    className={inputClass}
                  >
                    {THEME_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Bajada corta" className="sm:col-span-3">
                  <input
                    name="tagline"
                    defaultValue={cat.tagline ?? ""}
                    placeholder="Té frío + Fruta + bobas"
                    className={inputClass}
                  />
                </Field>

                <Field label="Descripción" className="sm:col-span-3">
                  <input
                    name="description"
                    defaultValue={cat.description ?? ""}
                    className={inputClass}
                  />
                </Field>

                <div className="sm:col-span-3">
                  <Toggle
                    name="active"
                    label="Visible en la carta"
                    defaultChecked={cat.active}
                  />
                </div>

                <div className="flex items-end gap-2 sm:col-span-3">
                  <Button variant="primary">Guardar</Button>
                  <span className="rounded-full border-2 border-cream/15 px-4 py-2.5 text-sm text-cream/45">
                    {cat._count.products} producto(s)
                  </span>
                </div>
              </form>

              <form
                action={deleteCategory}
                className="mt-3 border-t-2 border-cream/8 pt-3"
              >
                <input type="hidden" name="id" value={cat.id} />
                <Button variant="danger" className="!px-4 !py-2 !text-sm">
                  Eliminar categoría
                </Button>
              </form>
            </Panel>
          ))}
        </div>

        {/* Nueva categoría */}
        {/* Columna lateral: altas de categoría y subcategorías */}
        <div className="h-fit space-y-4 xl:sticky xl:top-6">
          <Panel title="Nueva categoría">
            <form action={saveCategory} className="space-y-4">
              <Field label="Nombre">
                <input
                  name="name"
                  required
                  placeholder="Frappés"
                  className={inputClass}
                />
              </Field>
              <Field label="Bajada corta">
                <input
                  name="tagline"
                  placeholder="Cremosos y helados"
                  className={inputClass}
                />
              </Field>
              <Field label="Descripción">
                <textarea
                  name="description"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </Field>
              <Field
                label="Qué sirve"
                hint="decide el dibujo y cómo se le llama"
              >
                <select
                  name="kind"
                  defaultValue="bebida"
                  className={inputClass}
                >
                  {KIND_OPTIONS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tema visual">
                <select
                  name="theme"
                  defaultValue="green"
                  className={inputClass}
                >
                  {THEME_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Orden">
                <input
                  name="position"
                  type="number"
                  defaultValue={categories.length}
                  className={inputClass}
                />
              </Field>
              <Toggle
                name="active"
                label="Visible en la carta"
                defaultChecked
              />
              <Button variant="primary" className="w-full">
                Crear categoría
              </Button>
            </form>
          </Panel>

          {/* Subcategorías: transversales a las familias. Un matcha y un cold brew
            pueden ser los dos Signature, por eso no cuelgan de una categoría. */}
          <Panel title="Subcategorías">
            <p className="-mt-2 mb-4 text-sm text-cream/45">
              Clásico, Signature… Se asignan a cada producto desde su ficha.
            </p>

            <div className="space-y-2">
              {subcategories.map((sc) => (
                <div key={sc.id} className="rounded-xl bg-cream/5 p-2">
                  <form
                    action={saveSubcategory}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input type="hidden" name="id" value={sc.id} />
                    <input type="hidden" name="position" value={sc.position} />
                    <input
                      name="name"
                      defaultValue={sc.name}
                      className={`${inputClass} min-w-0 flex-1`}
                    />
                    <Toggle
                      name="active"
                      label="Activa"
                      defaultChecked={sc.active}
                    />
                    <Button variant="primary" className="!px-3 !py-2 !text-sm">
                      Guardar
                    </Button>
                  </form>
                  <div className="mt-1.5 flex items-center justify-between px-1">
                    <span className="text-xs text-cream/40">
                      {sc._count.products} productos
                    </span>
                    <form action={deleteSubcategory}>
                      <input type="hidden" name="id" value={sc.id} />
                      <button className="text-xs font-bold text-cream/40 underline underline-offset-2 transition hover:text-red-300">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
              ))}

              {subcategories.length === 0 && (
                <p className="text-sm text-cream/40">
                  Todavía no hay. Crea{" "}
                  <strong className="text-cream">Clásico</strong> y{" "}
                  <strong className="text-cream">Signature</strong> abajo.
                </p>
              )}
            </div>

            <form
              action={saveSubcategory}
              className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-cream/15 p-2"
            >
              <input type="hidden" name="active" value="true" />
              <input
                type="hidden"
                name="position"
                value={subcategories.length}
              />
              <input
                name="name"
                required
                placeholder="Nueva subcategoría"
                className={`${inputClass} min-w-0 flex-1`}
              />
              <Button variant="primary" className="!px-3 !py-2 !text-sm">
                + Agregar
              </Button>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
