import { prisma } from "@/lib/prisma";
import { formatDate, toNumber } from "@/lib/format";
import {
  eventoPublicado,
  getSettings,
  pedidosEventoActivos,
  preciosEventoVisibles,
} from "@/lib/settings";
import {
  addEventPhoto,
  deleteEventOrder,
  deleteEventPhoto,
  deleteEventProduct,
  limpiarPedidosEvento,
  marcarPedidoEvento,
  moveEventProduct,
  saveEventProduct,
  saveSettings,
} from "@/app/admin/actions";
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

/** Las familias de la carta: de aquí salen los colores de la ilustración. */
const FAMILIAS = [
  { slug: "sparkling-tea", name: "Sparkling Tea", kind: "bebida" },
  { slug: "matcha", name: "Matcha", kind: "bebida" },
  { slug: "cold-brew", name: "Cold Brew", kind: "bebida" },
  { slug: "milk-tea", name: "Milk Tea", kind: "bebida" },
  { slug: "postres", name: "Postres", kind: "postre" },
];

export default async function EventoAdminPage() {
  const [settings, productos, fotos, pedidos] = await Promise.all([
    getSettings(),
    prisma.eventProduct.findMany({ orderBy: { position: "asc" } }),
    prisma.eventPhoto.findMany({ orderBy: { position: "asc" } }),
    // Los pendientes primero y los más viejos arriba: en la barra se prepara
    // por orden de llegada
    prisma.eventOrder.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      include: { items: true },
    }),
  ]);

  const pendientes = pedidos.filter((p) => p.status !== "ENTREGADO").length;

  const publicada = eventoPublicado(settings);

  return (
    <>
      <AdminHeader kicker="página de feria" title="Modo evento" />

      <p className="-mt-4 mb-6 max-w-2xl text-sm leading-snug text-cream/45">
        Arma la página <code className="text-roa-300">/evento</code> para una feria o
        un Pop Up: su afiche, su carta con los precios del día y las fotos. La carta
        del local no se toca.{" "}
        {publicada ? (
          <span className="font-bold text-mango">Está publicada.</span>
        ) : (
          <span className="font-bold text-cream/70">
            Está apagada: quien entre verá un 404.
          </span>
        )}
      </p>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* ── Datos de la página ── */}
        <form action={saveSettings}>
          <Panel title="La página">
            <div className="space-y-4">
              <Toggle
                name="eventPageActive"
                label="Publicar la página /evento"
                defaultChecked={publicada}
              />
              <Toggle
                name="eventOrdersActive"
                label="Permitir pedidos desde la carta"
                defaultChecked={pedidosEventoActivos(settings)}
              />
              <Field label="Título">
                <input
                  name="eventTitle"
                  defaultValue={settings.eventTitle}
                  className={inputClass}
                />
              </Field>
              <Field label="Bajada manuscrita">
                <input
                  name="eventKicker"
                  defaultValue={settings.eventKicker}
                  className={`${inputClass} font-hand text-xl`}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Dónde" hint="Vacío: no se muestra.">
                  <input
                    name="eventPlace"
                    defaultValue={settings.eventPlace}
                    placeholder="Parque Kennedy, Miraflores"
                    className={inputClass}
                  />
                </Field>
                <Field label="Cuándo" hint="Se muestra tal cual lo escribas.">
                  <input
                    name="eventDate"
                    defaultValue={settings.eventDate}
                    placeholder="Sáb 25 y Dom 26 de octubre"
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Nota" hint="Un párrafo corto bajo el título.">
                <textarea
                  name="eventNote"
                  rows={2}
                  defaultValue={settings.eventNote}
                  className={`${inputClass} resize-none`}
                />
              </Field>
              <Button variant="primary">Guardar página</Button>
            </div>
          </Panel>
        </form>

        {/* ── Afiche y títulos ── */}
        <form action={saveSettings}>
          <Panel title="Afiche y títulos">
            <div className="space-y-4">
              <Field
                label="URL del afiche"
                hint="Pega la dirección de la imagen. Vacío: no se muestra el bloque."
              >
                <input
                  name="eventPosterUrl"
                  defaultValue={settings.eventPosterUrl}
                  placeholder="https://… o /img/…"
                  className={inputClass}
                />
              </Field>
              <Field
                label="Alt text del afiche"
                hint="Lo que se lee si la imagen no carga."
              >
                <input
                  name="eventPosterAlt"
                  defaultValue={settings.eventPosterAlt}
                  className={inputClass}
                />
              </Field>

              {settings.eventPosterUrl.trim() && (
                <div className="rounded-2xl border-2 border-cream/10 bg-roa-950 p-3">
                  <p className="mb-2 text-xs font-bold text-roa-300">Así se ve hoy</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.eventPosterUrl}
                    alt=""
                    className="max-h-56 w-full rounded-xl object-contain"
                  />
                </div>
              )}

              <Toggle
                name="eventShowPrices"
                label="Mostrar los precios en la carta"
                defaultChecked={preciosEventoVisibles(settings)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Título de la carta">
                  <input
                    name="eventMenuTitle"
                    defaultValue={settings.eventMenuTitle}
                    className={inputClass}
                  />
                </Field>
                <Field label="Título de la galería">
                  <input
                    name="eventGalleryTitle"
                    defaultValue={settings.eventGalleryTitle}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Button variant="primary">Guardar afiche</Button>
            </div>
          </Panel>
        </form>
      </div>

      {/* ── La carta del evento ── */}
      <Panel title={`La carta del evento (${productos.length})`} className="mt-6">
        <div className="space-y-4">
          {productos.map((p, i) => (
            <div
              key={p.id}
              className="rounded-2xl border-2 border-cream/10 bg-roa-950 p-4"
            >
            <form action={saveEventProduct}>
              <input type="hidden" name="id" value={p.id} />

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <Field label="Título del producto">
                  <input name="name" defaultValue={p.name} className={inputClass} />
                </Field>
                <Field label="Precio">
                  <input
                    name="price"
                    type="number"
                    step="0.10"
                    min="0"
                    defaultValue={toNumber(p.price)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Descripción" className="mt-4">
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={p.description ?? ""}
                  className={`${inputClass} resize-none`}
                />
              </Field>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Familia" hint="Define los colores del dibujo.">
                  <select
                    name="categorySlug"
                    defaultValue={p.categorySlug}
                    className={inputClass}
                  >
                    {FAMILIAS.map((f) => (
                      <option key={f.slug} value={f.slug}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Qué es">
                  <select name="kind" defaultValue={p.kind} className={inputClass}>
                    <option value="bebida">Bebida</option>
                    <option value="comida">Comida</option>
                    <option value="postre">Postre</option>
                  </select>
                </Field>
                <Field label="Temperatura">
                  <select
                    name="temperature"
                    defaultValue={p.temperature}
                    className={inputClass}
                  >
                    <option value="frio">Frío</option>
                    <option value="caliente">Caliente</option>
                  </select>
                </Field>
                <Field label="Etiqueta">
                  <select
                    name="badge"
                    defaultValue={p.badge ?? ""}
                    className={inputClass}
                  >
                    <option value="">Sin etiqueta</option>
                    <option value="nuevo">Nuevo</option>
                    <option value="estrella">★ Top</option>
                  </select>
                </Field>
              </div>

              <Field
                label="URL de la foto"
                hint="Vacío: se dibuja la ilustración, como en la carta."
                className="mt-4"
              >
                <input
                  name="imageUrl"
                  defaultValue={p.imageUrl ?? ""}
                  placeholder="https://… o /img/…"
                  className={inputClass}
                />
              </Field>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Toggle name="active" label="Visible" defaultChecked={p.active} />
                <Button variant="primary">Guardar</Button>
              </div>
            </form>

            {/* Mover y eliminar van en formularios hermanos, no dentro del
                de arriba: un <form> no puede contener a otro. */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t-2 border-cream/8 pt-4">
              {i > 0 && (
                <form action={moveEventProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="dir" value="up" />
                  <Button variant="ghost">↑ Subir</Button>
                </form>
              )}
              {i < productos.length - 1 && (
                <form action={moveEventProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="dir" value="down" />
                  <Button variant="ghost">↓ Bajar</Button>
                </form>
              )}
              <form action={deleteEventProduct} className="ml-auto">
                <input type="hidden" name="id" value={p.id} />
                <Button variant="danger">Eliminar</Button>
              </form>
            </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ── Agregar producto ── */}
      <Panel title="Agregar a la carta del evento" className="mt-6">
        <form action={saveEventProduct} className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Field label="Título del producto">
              <input name="name" placeholder="Matcha Latte" className={inputClass} />
            </Field>
            <Field label="Precio">
              <input
                name="price"
                type="number"
                step="0.10"
                min="0"
                defaultValue="12"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Descripción">
            <textarea
              name="description"
              rows={2}
              placeholder="Matcha ceremonial con leche fresca y hielo."
              className={`${inputClass} resize-none`}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Familia">
              <select name="categorySlug" className={inputClass}>
                {FAMILIAS.map((f) => (
                  <option key={f.slug} value={f.slug}>
                    {f.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Qué es">
              <select name="kind" className={inputClass}>
                <option value="bebida">Bebida</option>
                <option value="comida">Comida</option>
                <option value="postre">Postre</option>
              </select>
            </Field>
            <Field label="Temperatura">
              <select name="temperature" className={inputClass}>
                <option value="frio">Frío</option>
                <option value="caliente">Caliente</option>
              </select>
            </Field>
            <Field label="Etiqueta">
              <select name="badge" className={inputClass}>
                <option value="">Sin etiqueta</option>
                <option value="nuevo">Nuevo</option>
                <option value="estrella">★ Top</option>
              </select>
            </Field>
          </div>

          <Field label="URL de la foto" hint="Vacío: se dibuja la ilustración.">
            <input name="imageUrl" placeholder="https://… o /img/…" className={inputClass} />
          </Field>

          <div className="flex items-center gap-3">
            <Toggle name="active" label="Visible" defaultChecked />
            <Button variant="primary">Agregar</Button>
          </div>
        </form>
      </Panel>

      {/* ── Galería ── */}
      <Panel title={`Fotos del carrusel (${fotos.length})`} className="mt-6">
        <form action={addEventPhoto} className="flex flex-wrap items-end gap-3">
          <Field label="URL de la foto" className="min-w-[18rem] flex-1">
            <input name="url" placeholder="https://… o /img/…" className={inputClass} />
          </Field>
          <Field label="Pie de foto (opcional)" className="min-w-[14rem] flex-1">
            <input name="caption" className={inputClass} />
          </Field>
          <Button variant="primary">Agregar foto</Button>
        </form>

        {fotos.length === 0 ? (
          <p className="mt-5 text-sm text-cream/40">
            Sin fotos todavía. El carrusel no se muestra hasta que agregues la primera.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {fotos.map((f) => (
              <div
                key={f.id}
                className="rounded-2xl border-2 border-cream/10 bg-roa-950 p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.url}
                  alt=""
                  className="aspect-[4/5] w-full rounded-xl object-cover"
                />
                {f.caption && (
                  <p className="mt-1.5 px-1 text-xs leading-snug text-cream/50">
                    {f.caption}
                  </p>
                )}
                <form action={deleteEventPhoto} className="mt-2">
                  <input type="hidden" name="id" value={f.id} />
                  <Button variant="danger" className="w-full">
                    Quitar
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* ── Pedidos del evento ── */}
      <Panel title={`Pedidos del evento (${pedidos.length})`} className="mt-6">
        <p className="-mt-2 mb-5 max-w-2xl text-sm leading-snug text-cream/45">
          Son los pedidos que la gente hace desde la carta de este evento. No se
          mezclan con los del local ni aparecen en Pedidos. Son temporales: al
          terminar la feria los borras desde abajo.
          {pendientes > 0 && (
            <strong className="ml-1 text-mango">{pendientes} sin entregar.</strong>
          )}
        </p>

        {pedidos.length === 0 ? (
          <EmptyState
            title="Sin pedidos todavía"
            text="Aparecen acá apenas alguien pida desde la carta del evento."
          />
        ) : (
          <>
            <div className="space-y-3">
              {pedidos.map((o) => {
                const entregado = o.status === "ENTREGADO";
                return (
                  <div
                    key={o.id}
                    className={`rounded-2xl border-2 bg-roa-950 p-4 ${
                      entregado ? "border-cream/8 opacity-55" : "border-mango/40"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full border-2 border-ink bg-mango px-3 py-1 font-display text-xl text-ink">
                        {o.code}
                      </span>
                      <span className="font-display text-lg text-cream">
                        {o.customerName}
                      </span>
                      {o.phone && (
                        <span className="text-sm text-cream/45">{o.phone}</span>
                      )}
                      <span className="ml-auto font-display text-xl text-cream">
                        {settings.currency} {toNumber(o.total).toFixed(2)}
                      </span>
                      <span className="text-sm text-cream/35">
                        {formatDate(o.createdAt)}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-1">
                      {o.items.map((i) => (
                        <li key={i.id} className="text-sm text-cream/70">
                          {i.quantity}× {i.name}
                        </li>
                      ))}
                    </ul>

                    {o.note && (
                      <p className="mt-2 rounded-xl border-2 border-cream/10 px-3 py-2 text-sm text-cream/60">
                        {o.note}
                      </p>
                    )}

                    <div className="mt-3 flex gap-2">
                      <form action={marcarPedidoEvento}>
                        <input type="hidden" name="id" value={o.id} />
                        <Button variant={entregado ? "ghost" : "primary"}>
                          {entregado ? "Volver a pendiente" : "Entregado"}
                        </Button>
                      </form>
                      <form action={deleteEventOrder} className="ml-auto">
                        <input type="hidden" name="id" value={o.id} />
                        <Button variant="danger">Borrar</Button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Cerrar el evento ── */}
            <form
              action={limpiarPedidosEvento}
              className="mt-6 rounded-2xl border-2 border-berry/40 bg-roa-950 p-4"
            >
              <p className="font-display text-xl text-cream">Cerrar el evento</p>
              <p className="mt-1.5 max-w-2xl text-sm leading-snug text-cream/45">
                Borra los {pedidos.length} pedidos para empezar limpio en la
                próxima feria. No se puede deshacer, y por eso no pasa solo al
                apagar la página: escribe{" "}
                <strong className="text-cream/80">{pedidos.length}</strong> para
                confirmar.
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <Field label="Cuántos pedidos vas a borrar" className="w-52">
                  <input
                    name="confirmacion"
                    inputMode="numeric"
                    placeholder={String(pedidos.length)}
                    className={inputClass}
                  />
                </Field>
                <Button variant="danger">Borrar todos los pedidos</Button>
              </div>
            </form>
          </>
        )}
      </Panel>
    </>
  );
}
