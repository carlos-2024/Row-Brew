import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";
import { savePromo, deletePromo } from "@/app/admin/actions";
import {
  AdminHeader,
  Button,
  Field,
  Panel,
  Toggle,
  THEME_OPTIONS,
  inputClass,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function PromosPage() {
  const [promos, categories] = await Promise.all([
    prisma.promo.findMany({ orderBy: { position: "asc" } }),
    prisma.category.findMany({
      orderBy: { position: "asc" },
      select: { id: true, name: true, emoji: true },
    }),
  ]);

  return (
    <>
      <AdminHeader kicker="marketing" title="Promos" />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          {promos.map((promo) => (
            <Panel key={promo.id}>
              <form action={savePromo} className="grid gap-4 sm:grid-cols-6">
                <input type="hidden" name="id" value={promo.id} />

                <Field label="Título" className="sm:col-span-3">
                  <input name="title" defaultValue={promo.title} className={inputClass} />
                </Field>

                <Field label="Etiqueta" className="sm:col-span-1" hint="2x20">
                  <input
                    name="label"
                    defaultValue={promo.label}
                    className={`${inputClass} font-display text-lg`}
                  />
                </Field>

                <Field label="Precio total" className="sm:col-span-1">
                  <input
                    name="price"
                    type="number"
                    step="0.5"
                    defaultValue={toNumber(promo.price)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Cantidad" className="sm:col-span-1">
                  <input
                    name="quantity"
                    type="number"
                    defaultValue={promo.quantity}
                    className={inputClass}
                  />
                </Field>

                <Field label="Detalle" className="sm:col-span-4">
                  <input
                    name="detail"
                    defaultValue={promo.detail ?? ""}
                    placeholder="Válido para Mango · Fresa · Arándano"
                    className={inputClass}
                  />
                </Field>

                <Field label="Tema" className="sm:col-span-1">
                  <select name="theme" defaultValue={promo.theme} className={inputClass}>
                    {THEME_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Orden" className="sm:col-span-1">
                  <input
                    name="position"
                    type="number"
                    defaultValue={promo.position}
                    className={inputClass}
                  />
                </Field>

                <Field label="Categoría vinculada" className="sm:col-span-3">
                  <select
                    name="categoryId"
                    defaultValue={promo.categoryId ?? ""}
                    className={inputClass}
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="URL de imagen" className="sm:col-span-3">
                  <input
                    name="imageUrl"
                    defaultValue={promo.imageUrl ?? ""}
                    className={inputClass}
                  />
                </Field>

                <div className="sm:col-span-3">
                  <Toggle name="active" label="Promo activa" defaultChecked={promo.active} />
                </div>

                <div className="flex items-end gap-2 sm:col-span-3">
                  <Button variant="primary">Guardar</Button>
                </div>
              </form>

              <form action={deletePromo} className="mt-3 border-t-2 border-cream/8 pt-3">
                <input type="hidden" name="id" value={promo.id} />
                <Button variant="danger" className="!px-4 !py-2 !text-sm">
                  Eliminar promo
                </Button>
              </form>
            </Panel>
          ))}
        </div>

        <Panel title="Nueva promo" className="h-fit xl:sticky xl:top-6">
          <form action={savePromo} className="space-y-4">
            <Field label="Título">
              <input name="title" required placeholder="Milk Tea" className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Etiqueta">
                <input name="label" defaultValue="2x20" className={inputClass} />
              </Field>
              <Field label="Precio">
                <input
                  name="price"
                  type="number"
                  step="0.5"
                  defaultValue={20}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Detalle">
              <input
                name="detail"
                placeholder="Válido para Milk Tea · Taro Tapioca"
                className={inputClass}
              />
            </Field>
            <Field label="Categoría">
              <select name="categoryId" defaultValue="" className={inputClass}>
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tema visual">
              <select name="theme" defaultValue="purple" className={inputClass}>
                {THEME_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <input type="hidden" name="quantity" value="2" />
            <input type="hidden" name="position" value={promos.length} />
            <Toggle name="active" label="Promo activa" defaultChecked />
            <Button variant="primary" className="w-full">
              Crear promo
            </Button>
          </form>
        </Panel>
      </div>
    </>
  );
}
