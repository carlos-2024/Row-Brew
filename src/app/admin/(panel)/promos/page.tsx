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
  const [promos, categories, productos] = await Promise.all([
    prisma.promo.findMany({
      orderBy: { position: "asc" },
      include: { products: { select: { id: true } } },
    }),
    prisma.category.findMany({
      orderBy: { position: "asc" },
      select: { id: true, name: true, emoji: true },
    }),
    // Para marcar cuáles entran en cada promo. Las bebidas de aliados no
    // salen en la carta, así que tampoco entran en promociones.
    prisma.product.findMany({
      where: { active: true, allyId: null },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, name: true, price: true, categoryId: true },
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

                <div className="grid gap-3 sm:col-span-4 sm:grid-cols-2">
                  <Toggle name="active" label="Promo activa" defaultChecked={promo.active} />
                  <Toggle
                    name="autoApply"
                    label="Cobrar sola en el carrito"
                    defaultChecked={promo.autoApply}
                  />
                </div>

                {(() => {
                  const suyas = productos.filter(
                    (prod) => prod.categoryId === promo.categoryId
                  );
                  if (suyas.length === 0) return null;
                  const marcadas = new Set(promo.products.map((prod) => prod.id));

                  return (
                    <Field
                      label="Bebidas que entran"
                      className="sm:col-span-6"
                      hint="sin marcar ninguna entran todas las de la categoría"
                    >
                      <div className="grid max-h-56 gap-1 overflow-y-auto rounded-xl border-2 border-cream/12 p-2 sm:grid-cols-2">
                        {suyas.map((prod) => (
                          <label
                            key={prod.id}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-cream/8"
                          >
                            <input
                              type="checkbox"
                              name="productIds"
                              value={prod.id}
                              defaultChecked={marcadas.has(prod.id)}
                              className="h-4 w-4 shrink-0 accent-roa-500"
                            />
                            <span className="min-w-0 flex-1 truncate">{prod.name}</span>
                            <span className="shrink-0 text-cream/40">
                              S/ {toNumber(prod.price).toFixed(2)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </Field>
                  );
                })()}

                <div className="flex items-end gap-2 sm:col-span-2">
                  <Button variant="primary">Guardar</Button>
                </div>

                <p className="sm:col-span-6 rounded-xl border-2 border-roa-500/40 bg-roa-500/10 px-3 py-2 text-xs leading-relaxed text-roa-300">
                  En el sitio, esta promo siempre muestra el botón
                  <strong> Armar mi {promo.label}</strong>: el cliente elige sus
                  {" "}{promo.quantity} bebidas y paga {promo.price.toString()}.
                  {promo.autoApply
                    ? " Además, por tener activado Cobrar sola, ese precio también se aplica cuando junta esas bebidas una por una desde la carta."
                    : " Con Cobrar sola apagado, quien las agregue sueltas desde la carta paga el precio normal de cada una."}
                </p>
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
            <Toggle name="autoApply" label="Cobrar sola en el carrito" />
            <Button variant="primary" className="w-full">
              Crear promo
            </Button>
          </form>
        </Panel>
      </div>
    </>
  );
}
