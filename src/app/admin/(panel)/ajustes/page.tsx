import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { toNumber } from "@/lib/format";
import { saveSettings, saveExtra, deleteExtra } from "@/app/admin/actions";
import {
  AdminHeader,
  Button,
  Field,
  Panel,
  Toggle,
  inputClass,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const [settings, extras] = await Promise.all([
    getSettings(),
    prisma.extra.findMany({ orderBy: { position: "asc" } }),
  ]);

  return (
    <>
      <AdminHeader kicker="configuración" title="Ajustes" />

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Marca y hero */}
        <form action={saveSettings}>
          <Panel title="Marca y portada">
            <div className="space-y-4">
              <Field label="Nombre de la marca">
                <input
                  name="brandName"
                  defaultValue={settings.brandName}
                  className={inputClass}
                />
              </Field>
              <Field label="Bajada de marca">
                <input
                  name="tagline"
                  defaultValue={settings.tagline}
                  className={inputClass}
                />
              </Field>
              <Field label="Saludo manuscrito del hero">
                <input
                  name="heroKicker"
                  defaultValue={settings.heroKicker}
                  className={`${inputClass} font-hand text-xl`}
                />
              </Field>
              <Field label="Subtítulo del hero">
                <textarea
                  name="heroSubtitle"
                  rows={3}
                  defaultValue={settings.heroSubtitle}
                  className={`${inputClass} resize-none`}
                />
              </Field>
              <Field label="Nota de eventos">
                <textarea
                  name="eventsNote"
                  rows={2}
                  defaultValue={settings.eventsNote}
                  className={`${inputClass} resize-none`}
                />
              </Field>
              <Button variant="primary">Guardar marca</Button>
            </div>
          </Panel>
        </form>

        {/* Contacto */}
        <form action={saveSettings}>
          <Panel title="Contacto y operación">
            <div className="space-y-4">
              <Field
                label="WhatsApp (con código de país)"
                hint="Se usa para el botón de pedidos. Ej: 51933948864"
              >
                <input
                  name="whatsapp"
                  defaultValue={settings.whatsapp}
                  className={inputClass}
                />
              </Field>
              <Field label="WhatsApp visible">
                <input
                  name="whatsappDisplay"
                  defaultValue={settings.whatsappDisplay}
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Instagram">
                  <input
                    name="instagram"
                    defaultValue={settings.instagram}
                    className={inputClass}
                  />
                </Field>
                <Field label="TikTok">
                  <input
                    name="tiktok"
                    defaultValue={settings.tiktok}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Ubicación">
                <input
                  name="location"
                  defaultValue={settings.location}
                  className={inputClass}
                />
              </Field>
              <Field label="Horario">
                <input
                  name="schedule"
                  defaultValue={settings.schedule}
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-[6rem_1fr] gap-3">
                <Field label="Moneda">
                  <input
                    name="currency"
                    defaultValue={settings.currency}
                    className={inputClass}
                  />
                </Field>
                <Field label="Nota de delivery">
                  <input
                    name="deliveryNote"
                    defaultValue={settings.deliveryNote}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Button variant="primary">Guardar contacto</Button>
            </div>
          </Panel>
        </form>
      </div>

      {/* Extras */}
      <Panel title="Extras de la carta" className="mt-6">
        <p className="mb-5 text-sm text-cream/45">
          Son los adicionales que el cliente puede sumar a cualquier bebida (tapioca,
          popping boba, leche sin lactosa…). El precio se recalcula en el servidor al
          hacer el pedido.
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {extras.map((extra) => (
              <div
                key={extra.id}
                className="rounded-2xl border-2 border-cream/10 bg-roa-950 p-4"
              >
                <form action={saveExtra} className="grid grid-cols-[1fr_6rem] gap-3">
                  <input type="hidden" name="id" value={extra.id} />
                  <input type="hidden" name="position" value={extra.position} />
                  <input name="name" defaultValue={extra.name} className={inputClass} />
                  <input
                    name="price"
                    type="number"
                    step="0.5"
                    defaultValue={toNumber(extra.price)}
                    className={inputClass}
                  />
                  <div className="col-span-2 flex flex-wrap items-center gap-2">
                    <Toggle
                      name="active"
                      label="Activo"
                      defaultChecked={extra.active}
                    />
                    <Button variant="primary" className="!px-4 !py-2 !text-sm">
                      Guardar
                    </Button>
                  </div>
                </form>
                <form action={deleteExtra} className="mt-2">
                  <input type="hidden" name="id" value={extra.id} />
                  <Button variant="danger" className="!px-4 !py-1.5 !text-xs">
                    Eliminar
                  </Button>
                </form>
              </div>
            ))}
          </div>

          <form
            action={saveExtra}
            className="h-fit space-y-4 rounded-2xl border-2 border-dashed border-cream/15 p-5"
          >
            <h3 className="font-display text-xl text-cream">Nuevo extra</h3>
            <Field label="Nombre">
              <input name="name" required placeholder="Crema batida" className={inputClass} />
            </Field>
            <Field label="Precio (S/)">
              <input
                name="price"
                type="number"
                step="0.5"
                defaultValue={2}
                className={inputClass}
              />
            </Field>
            <input type="hidden" name="position" value={extras.length} />
            <Toggle name="active" label="Activo" defaultChecked />
            <Button variant="primary" className="w-full">
              Agregar extra
            </Button>
          </form>
        </div>
      </Panel>
    </>
  );
}
