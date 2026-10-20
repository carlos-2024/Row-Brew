import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { deleteDiscountCode, saveDiscountCode } from "@/app/admin/actions";
import {
  AdminHeader,
  Button,
  EmptyState,
  Field,
  Panel,
  Toggle,
  inputClass,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/** Date → "2026-11-30" para el input de fecha. */
const paraInput = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export default async function DescuentosPage() {
  const [codigos, aliados, settings] = await Promise.all([
    prisma.discountCode.findMany({
      orderBy: { createdAt: "desc" },
      include: { ally: { select: { name: true } } },
    }),
    prisma.ally.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getSettings(),
  ]);

  const cur = settings.currency;

  return (
    <>
      <AdminHeader kicker="cupones" title="Códigos de descuento" />

      <p className="-mt-4 mb-6 max-w-2xl text-sm leading-snug text-cream/45">
        Los códigos descuentan <strong className="text-cream/70">solo productos de
        marcas aliadas</strong>. Las bebidas de la casa nunca entran, aunque estén en
        el mismo pedido. El campo para canjearlos aparece en el carrito únicamente
        cuando el cliente lleva algo de un aliado.
      </p>

      {/* ── Crear ── */}
      <Panel title="Nuevo código">
        <form action={saveDiscountCode} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Código" hint="Se guarda en mayúsculas.">
              <input
                name="code"
                placeholder="ALIADO10"
                className={`${inputClass} uppercase`}
              />
            </Field>
            <Field label="Tipo">
              <select name="kind" className={inputClass}>
                <option value="porcentaje">Porcentaje</option>
                <option value="monto">Monto fijo</option>
              </select>
            </Field>
            <Field label="Valor" hint="10 = 10% o 10 soles, según el tipo.">
              <input
                name="value"
                type="number"
                step="0.10"
                min="0"
                defaultValue="10"
                className={inputClass}
              />
            </Field>
            <Field label="Aliado" hint="Vacío: vale para todos.">
              <select name="allyId" className={inputClass}>
                <option value="">Cualquier aliado</option>
                {aliados.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label={`Tope del descuento (${cur})`} hint="0 = sin tope. Solo para porcentaje.">
              <input name="maxDiscount" type="number" step="0.10" min="0" defaultValue="0" className={inputClass} />
            </Field>
            <Field label={`Compra mínima (${cur})`} hint="0 = sin mínimo. Cuenta solo lo de aliados.">
              <input name="minSubtotal" type="number" step="0.10" min="0" defaultValue="0" className={inputClass} />
            </Field>
            <Field label="Usos máximos" hint="0 = ilimitado.">
              <input name="maxUses" type="number" min="0" step="1" defaultValue="0" className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Desde">
                <input name="startsAt" type="date" className={inputClass} />
              </Field>
              <Field label="Hasta">
                <input name="endsAt" type="date" className={inputClass} />
              </Field>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Toggle name="active" label="Activo" defaultChecked />
            <Button variant="primary">Crear código</Button>
          </div>
        </form>
      </Panel>

      {/* ── Existentes ── */}
      <Panel title={`Códigos (${codigos.length})`} className="mt-6">
        {codigos.length === 0 ? (
          <EmptyState
            title="Todavía no hay códigos"
            text="Crea uno arriba. Mientras no exista ninguno activo, el carrito no cambia en nada."
          />
        ) : (
          <div className="space-y-4">
            {codigos.map((c) => {
              const agotado = c.maxUses > 0 && c.usedCount >= c.maxUses;

              return (
                <div
                  key={c.id}
                  className="rounded-2xl border-2 border-cream/10 bg-roa-950 p-4"
                >
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border-2 border-ink bg-mango px-3 py-1 font-display text-lg text-ink">
                      {c.code}
                    </span>
                    <span className="text-sm text-cream/50">
                      {c.kind === "monto"
                        ? `${cur} ${toNumber(c.value).toFixed(2)} de descuento`
                        : `${toNumber(c.value)}%`}
                      {" · "}
                      {c.ally ? c.ally.name : "cualquier aliado"}
                    </span>
                    <span className="ml-auto text-sm text-cream/40">
                      usado {c.usedCount}
                      {c.maxUses > 0 ? ` de ${c.maxUses}` : " veces"}
                    </span>
                    {!c.active && (
                      <span className="rounded-full border-2 border-cream/25 px-3 py-1 text-xs font-bold text-cream/50">
                        Inactivo
                      </span>
                    )}
                    {agotado && (
                      <span className="rounded-full border-2 border-berry px-3 py-1 text-xs font-bold text-berry">
                        Agotado
                      </span>
                    )}
                  </div>

                  <form action={saveDiscountCode}>
                    <input type="hidden" name="id" value={c.id} />

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <Field label="Código">
                        <input
                          name="code"
                          defaultValue={c.code}
                          className={`${inputClass} uppercase`}
                        />
                      </Field>
                      <Field label="Tipo">
                        <select name="kind" defaultValue={c.kind} className={inputClass}>
                          <option value="porcentaje">Porcentaje</option>
                          <option value="monto">Monto fijo</option>
                        </select>
                      </Field>
                      <Field label="Valor">
                        <input
                          name="value"
                          type="number"
                          step="0.10"
                          min="0"
                          defaultValue={toNumber(c.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Aliado">
                        <select
                          name="allyId"
                          defaultValue={c.allyId ?? ""}
                          className={inputClass}
                        >
                          <option value="">Cualquier aliado</option>
                          {aliados.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <Field label={`Tope (${cur})`}>
                        <input name="maxDiscount" type="number" step="0.10" min="0" defaultValue={toNumber(c.maxDiscount)} className={inputClass} />
                      </Field>
                      <Field label={`Compra mínima (${cur})`}>
                        <input name="minSubtotal" type="number" step="0.10" min="0" defaultValue={toNumber(c.minSubtotal)} className={inputClass} />
                      </Field>
                      <Field label="Usos máximos">
                        <input name="maxUses" type="number" min="0" step="1" defaultValue={c.maxUses} className={inputClass} />
                      </Field>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Desde">
                          <input name="startsAt" type="date" defaultValue={paraInput(c.startsAt)} className={inputClass} />
                        </Field>
                        <Field label="Hasta">
                          <input name="endsAt" type="date" defaultValue={paraInput(c.endsAt)} className={inputClass} />
                        </Field>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <Toggle name="active" label="Activo" defaultChecked={c.active} />
                      <Button variant="primary">Guardar</Button>
                    </div>
                  </form>

                  {/* Hermano y no anidado: un <form> no puede contener a otro */}
                  <form
                    action={deleteDiscountCode}
                    className="mt-4 border-t-2 border-cream/8 pt-4"
                  >
                    <input type="hidden" name="id" value={c.id} />
                    <Button variant="danger">Eliminar</Button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </>
  );
}
