import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { money, toNumber, DELIVERY_LABELS, STATUS_LABELS, formatDate } from "@/lib/format";
import BobaField from "@/components/BobaField";
import { Sparkle } from "@/components/Leaf";
import { BobaIcon, WhatsAppIcon } from "@/components/Icons";
import CupArt from "@/components/CupArt";

export const dynamic = "force-dynamic";

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const settings = await getSettings();

  const order = await prisma.order
    .findUnique({
      where: { code: code.toUpperCase() },
      include: { items: { include: { product: { include: { category: true } } } } },
    })
    .catch(() => null);

  if (!order) notFound();

  const wa = `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`;

  return (
    <div className="grain relative min-h-dvh overflow-hidden bg-roa-900 px-5 pb-24 pt-40 sm:pt-48">
      <div className="glow pointer-events-none absolute left-1/2 top-10 h-96 w-[36rem] -translate-x-1/2 opacity-50" />
      <BobaField count={18} />

      <div className="relative mx-auto max-w-2xl">
        <div className="text-center">
          <Sparkle className="mx-auto h-10 w-10 animate-spin-slow text-mango" />
          <p className="mt-4 font-hand text-3xl text-roa-300">¡pedido recibido!</p>
          <h1 className="mt-1 font-display text-[clamp(2.6rem,9vw,5rem)] leading-[0.88] text-cream">
            Gracias,
            <br />
            <span className="inline-flex items-center gap-3">
              {order.customerName.split(" ")[0]}
              <BobaIcon className="h-10 w-10 text-mango sm:h-14 sm:w-14" />
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-cream/65">
            Ya lo tenemos anotado. Confirmamos disponibilidad y pago por WhatsApp — si no
            se abrió solo, escríbenos con tu código.
          </p>
        </div>

        {/* Ticket */}
        <div className="mt-10 overflow-hidden rounded-[2rem] border-2 border-ink bg-cream text-ink shadow-[7px_7px_0_var(--color-ink)]">
          <div className="flex items-center justify-between gap-4 border-b-2 border-dashed border-ink/20 bg-roa-500 px-6 py-5 text-cream">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-roa-100">
                Código de pedido
              </p>
              <p className="font-display text-3xl">{order.code}</p>
            </div>
            <span className="rounded-full border-2 border-cream px-4 py-1.5 text-sm font-bold">
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>

          <ul className="divide-y divide-ink/10 px-6">
            {order.items.map((item) => {
              const extras = JSON.parse(item.extras || "[]") as { name: string }[];
              return (
                <li key={item.id} className="flex items-center gap-4 py-4">
                  <div className="grid h-16 w-12 shrink-0 place-items-center rounded-xl bg-roa-100">
                    <CupArt
                      name={item.name}
                      categorySlug={item.product?.category?.slug ?? "sparkling-tea"}
                      className="h-14"
                      animated={false}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-tight">
                      <span className="text-roa-600">{item.quantity}×</span> {item.name}
                    </p>
                    {extras.length > 0 && (
                      <p className="text-xs text-roa-600">
                        + {extras.map((e) => e.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="font-display text-xl">
                    {money(item.lineTotal, settings.currency)}
                  </span>
                </li>
              );
            })}
          </ul>

          <dl className="space-y-1.5 border-t-2 border-dashed border-ink/20 px-6 py-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/55">Entrega</dt>
              <dd className="font-bold">
                {DELIVERY_LABELS[order.deliveryType] ?? order.deliveryType}
              </dd>
            </div>
            {order.address && (
              <div className="flex justify-between gap-6">
                <dt className="text-ink/55">Dirección</dt>
                <dd className="text-right font-bold">{order.address}</dd>
              </div>
            )}
            {order.scheduledFor && (
              <div className="flex justify-between">
                <dt className="text-ink/55">Para</dt>
                <dd className="font-bold">{order.scheduledFor}</dd>
              </div>
            )}
            {order.notes && (
              <div className="flex justify-between gap-6">
                <dt className="text-ink/55">Notas</dt>
                <dd className="text-right font-bold">{order.notes}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink/55">Hecho el</dt>
              <dd className="font-bold">{formatDate(order.createdAt)}</dd>
            </div>
          </dl>

          {toNumber(order.subtotal) > toNumber(order.total) && (
            <div className="space-y-1 border-t-2 border-dashed border-ink/20 px-6 py-4 text-sm">
              <div className="flex justify-between text-ink/55">
                <span>Subtotal</span>
                <span>{money(toNumber(order.subtotal), settings.currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-roa-600">
                <span>Descuento por promociones</span>
                <span>
                  −
                  {money(
                    toNumber(order.subtotal) - toNumber(order.total),
                    settings.currency
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-baseline justify-between bg-ink px-6 py-5 text-cream">
            <span className="font-hand text-3xl text-roa-300">total</span>
            <span className="font-display text-4xl">
              {money(toNumber(order.total), settings.currency)}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine inline-flex items-center gap-2.5 rounded-full border-2 border-ink bg-[#25D366] px-7 py-4 font-display text-xl text-ink shadow-[5px_5px_0_var(--color-ink)] transition hover:translate-x-[-3px] hover:translate-y-[-3px]"
          >
            <WhatsAppIcon className="h-6 w-6" /> Confirmar por WhatsApp
          </a>
          <Link
            href="/carta"
            className="rounded-full border-2 border-cream px-7 py-4 font-display text-xl text-cream transition hover:bg-cream hover:text-roa-900"
          >
            Seguir pidiendo
          </Link>
        </div>
      </div>
    </div>
  );
}
