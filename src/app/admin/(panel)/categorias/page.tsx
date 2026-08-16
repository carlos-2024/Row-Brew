import { prisma } from "@/lib/prisma";
import { saveCategory, deleteCategory } from "@/app/admin/actions";
import {
  AdminHeader,
  Button,
  Field,
  Panel,
  Toggle,
  THEME_OPTIONS,
  inputClass,
} from "@/components/admin/ui";
import { CategoryIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });

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
                  <input name="name" defaultValue={cat.name} className={inputClass} />
                </Field>

                <Field label="Orden" className="sm:col-span-1">
                  <input
                    name="position"
                    type="number"
                    defaultValue={cat.position}
                    className={inputClass}
                  />
                </Field>

                <Field label="Tema" className="sm:col-span-1">
                  <select name="theme" defaultValue={cat.theme} className={inputClass}>
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

              <form action={deleteCategory} className="mt-3 border-t-2 border-cream/8 pt-3">
                <input type="hidden" name="id" value={cat.id} />
                <Button variant="danger" className="!px-4 !py-2 !text-sm">
                  Eliminar categoría
                </Button>
              </form>
            </Panel>
          ))}
        </div>

        {/* Nueva categoría */}
        <Panel title="Nueva categoría" className="h-fit xl:sticky xl:top-6">
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
            <Field label="Tema visual">
              <select name="theme" defaultValue="green" className={inputClass}>
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
            <Toggle name="active" label="Visible en la carta" defaultChecked />
            <Button variant="primary" className="w-full">
              Crear categoría
            </Button>
          </form>
        </Panel>
      </div>
    </>
  );
}
