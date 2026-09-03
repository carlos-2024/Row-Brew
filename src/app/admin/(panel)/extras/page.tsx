import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";
import {
  saveExtra,
  deleteExtra,
  saveExtraGroup,
  deleteExtraGroup,
  linkExtraGroupProducts,
} from "@/app/admin/actions";
import {
  AdminHeader,
  Button,
  Field,
  Panel,
  Toggle,
  inputClass,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/**
 * Opcionales del menú.
 *
 * Un opcional suelto se ofrece en todos los productos; agrupado, solo en los
 * que tengan ese grupo vinculado. Los grupos los arma el equipo desde acá: no
 * hay ninguno fijo en el código, porque cada carta necesita los suyos.
 */
export default async function ExtrasPage() {
  const [grupos, sueltos, productos] = await Promise.all([
    prisma.extraGroup.findMany({
      orderBy: { position: "asc" },
      include: {
        extras: { orderBy: [{ position: "asc" }, { name: "asc" }] },
        products: { select: { id: true } },
      },
    }),
    prisma.extra.findMany({
      where: { groupId: null },
      orderBy: [{ position: "asc" }, { name: "asc" }],
    }),
    prisma.product.findMany({
      where: { allyId: null },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        active: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  return (
    <>
      <AdminHeader kicker="menú" title="Opcionales" />

      <p className="-mt-4 mb-6 max-w-2xl text-sm text-cream/50">
        Agrupa los opcionales y elige qué productos los ofrecen. Un opcional sin
        grupo se sigue ofreciendo en todos.
      </p>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          {grupos.length === 0 && (
            <Panel>
              <p className="text-sm text-cream/55">
                Todavía no hay grupos. Crea el primero a la derecha — por ejemplo
                <strong className="text-cream"> Leche</strong> con sus opciones, y
                vincúlalo solo a las bebidas que la llevan.
              </p>
            </Panel>
          )}

          {grupos.map((grupo) => {
            const vinculados = new Set(grupo.products.map((p) => p.id));

            return (
              <Panel key={grupo.id}>
                {/* Datos del grupo */}
                <form action={saveExtraGroup} className="grid gap-4 sm:grid-cols-6">
                  <input type="hidden" name="id" value={grupo.id} />

                  <Field label="Nombre del grupo" className="sm:col-span-2">
                    <input
                      name="name"
                      defaultValue={grupo.name}
                      className={`${inputClass} font-display text-lg`}
                    />
                  </Field>

                  <Field label="Ayuda" className="sm:col-span-2" hint="elige una…">
                    <input
                      name="hint"
                      defaultValue={grupo.hint ?? ""}
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Máximo a elegir"
                    className="sm:col-span-1"
                    hint="0 = sin límite"
                  >
                    <input
                      name="maxChoices"
                      type="number"
                      min={0}
                      defaultValue={grupo.maxChoices}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Orden" className="sm:col-span-1">
                    <input
                      name="position"
                      type="number"
                      defaultValue={grupo.position}
                      className={inputClass}
                    />
                  </Field>

                  <div className="sm:col-span-3">
                    <Toggle
                      name="active"
                      label="Grupo activo"
                      defaultChecked={grupo.active}
                    />
                  </div>

                  <div className="flex items-end gap-2 sm:col-span-3">
                    <Button variant="primary">Guardar grupo</Button>
                  </div>
                </form>

                {/* Opciones del grupo */}
                <div className="mt-5 space-y-2 border-t-2 border-cream/8 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-cream/40">
                    {grupo.extras.length} opcionales
                  </p>

                  {grupo.extras.map((extra) => (
                    <form
                      key={extra.id}
                      action={saveExtra}
                      className="flex flex-wrap items-end gap-2 rounded-xl bg-cream/5 p-2"
                    >
                      <input type="hidden" name="id" value={extra.id} />
                      <input type="hidden" name="groupId" value={grupo.id} />
                      <input type="hidden" name="position" value={extra.position} />

                      <input
                        name="name"
                        defaultValue={extra.name}
                        className={`${inputClass} min-w-0 flex-1`}
                      />
                      <input
                        name="price"
                        type="number"
                        step="0.5"
                        defaultValue={toNumber(extra.price)}
                        className={`${inputClass} w-24`}
                      />
                      <Toggle
                        name="active"
                        label="Activo"
                        defaultChecked={extra.active}
                      />
                      <Button variant="primary" className="!px-4 !py-2 !text-sm">
                        Guardar
                      </Button>
                    </form>
                  ))}

                  {/* Alta rápida dentro del grupo */}
                  <form
                    action={saveExtra}
                    className="flex flex-wrap items-end gap-2 rounded-xl border-2 border-dashed border-cream/15 p-2"
                  >
                    <input type="hidden" name="groupId" value={grupo.id} />
                    <input type="hidden" name="active" value="true" />
                    <input
                      type="hidden"
                      name="position"
                      value={grupo.extras.length}
                    />
                    <input
                      name="name"
                      required
                      placeholder="Nuevo opcional"
                      className={`${inputClass} min-w-0 flex-1`}
                    />
                    <input
                      name="price"
                      type="number"
                      step="0.5"
                      defaultValue={0}
                      className={`${inputClass} w-24`}
                    />
                    <Button variant="primary" className="!px-4 !py-2 !text-sm">
                      + Agregar
                    </Button>
                  </form>
                </div>

                {/* Productos que lo ofrecen */}
                <form
                  action={linkExtraGroupProducts}
                  className="mt-5 border-t-2 border-cream/8 pt-4"
                >
                  <input type="hidden" name="id" value={grupo.id} />
                  <p className="text-xs font-bold uppercase tracking-wider text-cream/40">
                    Productos que lo ofrecen ({vinculados.size})
                  </p>

                  <div className="mt-2 grid max-h-60 gap-1 overflow-y-auto rounded-xl border-2 border-cream/12 p-2 sm:grid-cols-2">
                    {productos.map((prod) => (
                      <label
                        key={prod.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-cream/8"
                      >
                        <input
                          type="checkbox"
                          name="productIds"
                          value={prod.id}
                          defaultChecked={vinculados.has(prod.id)}
                          className="h-4 w-4 shrink-0 accent-roa-500"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {prod.name}
                          {!prod.active && (
                            <span className="ml-1.5 text-[10px] text-cream/40">
                              fuera de la carta
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-cream/35">
                          {prod.category.name}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-3">
                    <Button variant="primary">Vincular productos</Button>
                  </div>
                </form>

                <form
                  action={deleteExtraGroup}
                  className="mt-3 border-t-2 border-cream/8 pt-3"
                >
                  <input type="hidden" name="id" value={grupo.id} />
                  <Button variant="danger" className="!px-4 !py-2 !text-sm">
                    Eliminar grupo
                  </Button>
                </form>
              </Panel>
            );
          })}

          {/* Opcionales sin grupo */}
          <Panel title="Sin grupo · se ofrecen en todos los productos">
            <div className="space-y-2">
              {sueltos.map((extra) => (
                <form
                  key={extra.id}
                  action={saveExtra}
                  className="flex flex-wrap items-end gap-2 rounded-xl bg-cream/5 p-2"
                >
                  <input type="hidden" name="id" value={extra.id} />
                  <input type="hidden" name="position" value={extra.position} />

                  <input
                    name="name"
                    defaultValue={extra.name}
                    className={`${inputClass} min-w-0 flex-1`}
                  />
                  <input
                    name="price"
                    type="number"
                    step="0.5"
                    defaultValue={toNumber(extra.price)}
                    className={`${inputClass} w-24`}
                  />

                  <Field label="Mover a" className="w-40">
                    <select name="groupId" defaultValue="" className={inputClass}>
                      <option value="">Sin grupo</option>
                      {grupos.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Toggle name="active" label="Activo" defaultChecked={extra.active} />
                  <Button variant="primary" className="!px-4 !py-2 !text-sm">
                    Guardar
                  </Button>
                </form>
              ))}

              {sueltos.length === 0 && (
                <p className="text-sm text-cream/45">
                  Todos los opcionales están agrupados.
                </p>
              )}
            </div>
          </Panel>
        </div>

        {/* Alta de grupo y de opcional suelto */}
        <div className="space-y-4">
          <Panel title="Nuevo grupo">
            <form action={saveExtraGroup} className="space-y-3">
              <Field label="Nombre" hint="Leche, Boba, Tipo de café…">
                <input name="name" required className={inputClass} />
              </Field>
              <Field label="Ayuda" hint="se muestra bajo el título">
                <input name="hint" placeholder="elige una" className={inputClass} />
              </Field>
              <Field label="Máximo a elegir" hint="0 = sin límite · 1 = solo una">
                <input
                  name="maxChoices"
                  type="number"
                  min={0}
                  defaultValue={0}
                  className={inputClass}
                />
              </Field>
              <Field label="Orden">
                <input
                  name="position"
                  type="number"
                  defaultValue={grupos.length}
                  className={inputClass}
                />
              </Field>
              <Toggle name="active" label="Grupo activo" defaultChecked />
              <Button variant="primary" className="w-full">
                Crear grupo
              </Button>
            </form>
          </Panel>

          <Panel title="Nuevo opcional suelto">
            <form action={saveExtra} className="space-y-3">
              <Field label="Nombre">
                <input name="name" required className={inputClass} />
              </Field>
              <Field label="Precio">
                <input
                  name="price"
                  type="number"
                  step="0.5"
                  defaultValue={0}
                  className={inputClass}
                />
              </Field>
              <Field label="Grupo" hint="sin grupo aparece en todos">
                <select name="groupId" defaultValue="" className={inputClass}>
                  <option value="">Sin grupo</option>
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Orden">
                <input
                  name="position"
                  type="number"
                  defaultValue={sueltos.length}
                  className={inputClass}
                />
              </Field>
              <Toggle name="active" label="Activo" defaultChecked />
              <Button variant="primary" className="w-full">
                Crear opcional
              </Button>
            </form>
          </Panel>

          <Panel title="Eliminar opcional">
            <div className="space-y-2">
              {[...grupos.flatMap((g) => g.extras), ...sueltos].map((extra) => (
                <form
                  key={extra.id}
                  action={deleteExtra}
                  className="flex items-center justify-between gap-2"
                >
                  <input type="hidden" name="id" value={extra.id} />
                  <span className="min-w-0 flex-1 truncate text-sm text-cream/70">
                    {extra.name}
                  </span>
                  <Button variant="danger" className="!px-3 !py-1.5 !text-xs">
                    Eliminar
                  </Button>
                </form>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
