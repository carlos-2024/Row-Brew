import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import {
  EVENT_STATUS_LABELS,
  formatEventDate,
  toIsoDate,
  todayUtc,
} from "@/lib/events";
import { updateEventRequest, deleteEventRequest } from "@/app/admin/actions";
import BlockDateCalendar from "@/components/admin/BlockDateCalendar";
import {
  AdminHeader,
  Button,
  EmptyState,
  Panel,
  StatCard,
  inputClass,
} from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/Icons";
import type { EventStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const ESTADOS: EventStatus[] = [
  "NUEVA",
  "CONTACTADO",
  "COTIZADO",
  "CONFIRMADO",
  "CERRADO",
  "DESCARTADO",
];

const TONO: Record<string, string> = {
  NUEVA: "bg-mango text-ink",
  CONTACTADO: "bg-grape text-ink",
  COTIZADO: "bg-roa-400 text-ink",
  CONFIRMADO: "bg-roa-600 text-cream",
  CERRADO: "bg-roa-800 text-cream",
  DESCARTADO: "bg-berry text-cream",
};

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const filtro =
    estado && ESTADOS.includes(estado as EventStatus)
      ? (estado as EventStatus)
      : undefined;

  const hoy = todayUtc();

  const [solicitudes, conteos, nuevas, proximos, bloqueadas, confirmados] =
    await Promise.all([
      prisma.eventRequest.findMany({
        where: filtro ? { status: filtro } : undefined,
        orderBy: [{ eventDate: "asc" }, { createdAt: "desc" }],
        take: 100,
      }),
      prisma.eventRequest.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.eventRequest.count({ where: { status: "NUEVA" } }),
      prisma.eventRequest.count({
        where: { status: "CONFIRMADO", eventDate: { gte: hoy } },
      }),
      prisma.blockedDate.findMany({ orderBy: { date: "asc" } }),
      prisma.eventRequest.findMany({
        where: { status: "CONFIRMADO" },
        select: { eventDate: true },
      }),
    ]);

  const total = conteos.reduce((s, c) => s + c._count._all, 0);
  const cuenta = (e: EventStatus) =>
    conteos.find((c) => c.status === e)?._count._all ?? 0;

  return (
    <>
      <AdminHeader kicker="cotizaciones" title="Eventos" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Sin atender"
          value={nuevas}
          tone={nuevas > 0 ? "mango" : "green"}
          hint={nuevas > 0 ? "Esperando respuesta" : "Todo al día"}
        />
        <StatCard label="Eventos confirmados" value={proximos} tone="grape" hint="Por venir" />
        <StatCard label="Solicitudes totales" value={total} tone="cream" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div>
          {/* Filtros */}
          <div className="mb-4 flex flex-wrap gap-2">
            <Link
              href="/admin/eventos"
              className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                !filtro
                  ? "border-ink bg-cream text-ink"
                  : "border-cream/20 text-cream/60 hover:border-cream hover:text-cream"
              }`}
            >
              Todas ({total})
            </Link>
            {ESTADOS.map((e) => (
              <Link
                key={e}
                href={`/admin/eventos?estado=${e}`}
                className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                  filtro === e
                    ? `border-ink ${TONO[e]}`
                    : "border-cream/20 text-cream/60 hover:border-cream hover:text-cream"
                }`}
              >
                {EVENT_STATUS_LABELS[e]} ({cuenta(e)})
              </Link>
            ))}
          </div>

          {solicitudes.length === 0 ? (
            <EmptyState
              title="Sin solicitudes"
              text="Cuando alguien complete el formulario de 'Cotizar mi evento' en el sitio, aparecerá acá."
            />
          ) : (
            <div className="space-y-4">
              {solicitudes.map((s) => {
                const pasado = s.eventDate < hoy;
                return (
                  <Panel key={s.id}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${TONO[s.status]}`}
                          >
                            {EVENT_STATUS_LABELS[s.status]}
                          </span>
                          <span className="font-display text-lg text-cream">
                            {s.code}
                          </span>
                          {pasado && (
                            <span className="rounded-full border-2 border-cream/20 px-2.5 py-0.5 text-[11px] font-bold text-cream/40">
                              fecha pasada
                            </span>
                          )}
                        </div>

                        <p className="mt-2 font-bold text-cream">{s.name}</p>
                        <p className="text-sm text-cream/50">{s.email}</p>
                        <a
                          href={`https://wa.me/${s.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1.5 text-sm text-roa-300 underline-offset-2 hover:underline"
                        >
                          <WhatsAppIcon className="h-4 w-4" /> {s.phone}
                        </a>
                      </div>

                      <div className="text-right">
                        <p className="font-display text-xl capitalize leading-tight text-mango">
                          {formatEventDate(s.eventDate)}
                        </p>
                        <p className="mt-1 text-sm text-cream/60">{s.eventType}</p>
                        <p className="mt-1 text-xs text-cream/35">
                          Pedida el {formatDate(s.createdAt)}
                        </p>
                      </div>
                    </div>

                    {s.notes && (
                      <p className="mt-3 rounded-xl bg-roa-950 px-4 py-3 text-sm text-cream/70">
                        <span className="font-bold text-cream/40">Del cliente: </span>
                        {s.notes}
                      </p>
                    )}

                    <form
                      action={updateEventRequest}
                      className="mt-4 flex flex-wrap items-end gap-2 border-t-2 border-cream/8 pt-4"
                    >
                      <input type="hidden" name="id" value={s.id} />
                      <select
                        name="status"
                        defaultValue={s.status}
                        className={`${inputClass} w-40 py-2`}
                      >
                        {ESTADOS.map((e) => (
                          <option key={e} value={e}>
                            {EVENT_STATUS_LABELS[e]}
                          </option>
                        ))}
                      </select>
                      <input
                        name="internalNotes"
                        defaultValue={s.internalNotes ?? ""}
                        placeholder="Nota interna (monto cotizado, acuerdos…)"
                        className={`${inputClass} min-w-[14rem] flex-1 py-2`}
                      />
                      <Button variant="primary">Guardar</Button>
                    </form>

                    <form action={deleteEventRequest} className="mt-2">
                      <input type="hidden" name="id" value={s.id} />
                      <Button variant="danger" className="!px-4 !py-1.5 !text-xs">
                        Eliminar
                      </Button>
                    </form>
                  </Panel>
                );
              })}
            </div>
          )}
        </div>

        {/* Calendario de disponibilidad */}
        <Panel title="Disponibilidad" className="h-fit xl:sticky xl:top-6">
          <p className="mb-4 text-sm text-cream/45">
            Marca los días que no puedes atender. En el formulario del sitio
            aparecen tachados y el cliente no los puede elegir.
          </p>

          <BlockDateCalendar
            blocked={bloqueadas.map((b) => toIsoDate(b.date))}
            locked={confirmados.map((c) => toIsoDate(c.eventDate))}
          />

          {bloqueadas.length > 0 && (
            <div className="mt-5 border-t-2 border-cream/8 pt-4">
              <p className="mb-2 text-sm font-bold text-roa-300">
                Días bloqueados ({bloqueadas.length})
              </p>
              <ul className="space-y-1 text-sm text-cream/60">
                {bloqueadas.slice(0, 10).map((b) => (
                  <li key={b.id} className="capitalize">
                    {formatEventDate(b.date)}
                    {b.reason && (
                      <span className="text-cream/35"> — {b.reason}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-5 border-t-2 border-cream/8 pt-4 text-xs text-cream/35">
            Los días con un evento en estado <strong>Confirmado</strong> se
            bloquean solos.
          </p>
        </Panel>
      </div>
    </>
  );
}
