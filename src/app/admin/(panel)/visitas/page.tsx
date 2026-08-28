import { prisma } from "@/lib/prisma";
import { AdminHeader, EmptyState, Panel, StatCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/** Medianoche de hace `dias` días, en hora local del servidor. */
function desdeHace(dias: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - dias);
  return d;
}

const DIAS_GRAFICO = 14;

export default async function VisitasPage() {
  const hoy = desdeHace(0);
  const hace7 = desdeHace(6);
  const hace30 = desdeHace(29);
  const inicioGrafico = desdeHace(DIAS_GRAFICO - 1);

  // Solo visitas del público: las del equipo se excluyen para no inflar
  const publico = { team: false };

  const [
    visitasHoy,
    unicosHoy,
    visitas7,
    unicos7,
    visitas30,
    unicos30,
    porDia,
    topReferrers,
    total,
  ] = await Promise.all([
    prisma.visit.count({ where: { ...publico, createdAt: { gte: hoy } } }),
    prisma.visit.groupBy({
      by: ["visitorId"],
      where: { ...publico, createdAt: { gte: hoy } },
    }),
    prisma.visit.count({ where: { ...publico, createdAt: { gte: hace7 } } }),
    prisma.visit.groupBy({
      by: ["visitorId"],
      where: { ...publico, createdAt: { gte: hace7 } },
    }),
    prisma.visit.count({ where: { ...publico, createdAt: { gte: hace30 } } }),
    prisma.visit.groupBy({
      by: ["visitorId"],
      where: { ...publico, createdAt: { gte: hace30 } },
    }),
    prisma.$queryRaw<{ dia: Date; visitas: bigint; personas: bigint }[]>`
      SELECT date_trunc('day', "createdAt") AS dia,
             COUNT(*)::bigint              AS visitas,
             COUNT(DISTINCT "visitorId")::bigint AS personas
      FROM "Visit"
      WHERE team = false AND "createdAt" >= ${inicioGrafico}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.visit.groupBy({
      by: ["referrer"],
      where: {
        ...publico,
        createdAt: { gte: hace30 },
        referrer: { not: null },
      },
      _count: { _all: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 6,
    }),
    prisma.visit.count({ where: publico }),
  ]);

  // Se rellenan los días sin visitas para que el gráfico no tenga huecos
  const mapa = new Map(
    porDia.map((r) => [
      new Date(r.dia).toISOString().slice(0, 10),
      { visitas: Number(r.visitas), personas: Number(r.personas) },
    ])
  );
  const serie = Array.from({ length: DIAS_GRAFICO }, (_, i) => {
    const d = desdeHace(DIAS_GRAFICO - 1 - i);
    const clave = d.toISOString().slice(0, 10);
    return {
      clave,
      etiqueta: new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "2-digit",
      }).format(d),
      ...(mapa.get(clave) ?? { visitas: 0, personas: 0 }),
    };
  });

  const maxDia = Math.max(1, ...serie.map((d) => d.visitas));

  return (
    <>
      <AdminHeader kicker="pantalla de espera" title="Visitas" />

      <p className="-mt-4 mb-6 max-w-2xl text-sm text-cream/45">
        Cuánta gente está llegando a la pantalla de lanzamiento mientras la web
        no está abierta al público.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Hoy"
          value={visitasHoy}
          tone="mango"
          hint={`${unicosHoy.length} persona${unicosHoy.length === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Últimos 7 días"
          value={visitas7}
          tone="green"
          hint={`${unicos7.length} personas distintas`}
        />
        <StatCard
          label="Últimos 30 días"
          value={visitas30}
          tone="grape"
          hint={`${unicos30.length} personas distintas`}
        />
        <StatCard label="Total histórico" value={total} tone="cream" />
      </div>

      <Panel title={`Últimos ${DIAS_GRAFICO} días`} className="mt-6">
        {total === 0 ? (
          <EmptyState
            title="Todavía sin visitas"
            text="En cuanto alguien abra la pantalla de espera, aparecerá acá. Tus propias visitas con la cookie de vista previa no se cuentan."
          />
        ) : (
          <div className="flex h-56 items-end gap-1.5 sm:gap-2">
            {serie.map((d) => (
              <div key={d.clave} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-cream/60 tabular-nums">
                  {d.visitas > 0 ? d.visitas : ""}
                </span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-roa-600 to-roa-400 transition-all"
                  style={{
                    height: `${Math.max(d.visitas > 0 ? 6 : 2, (d.visitas / maxDia) * 100)}%`,
                  }}
                  title={`${d.visitas} visitas · ${d.personas} personas`}
                />
                <span className="text-[10px] text-cream/35 tabular-nums">
                  {d.etiqueta}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="mt-6">
        <Panel title="De dónde llegan">
          {topReferrers.length === 0 ? (
            <EmptyState
              title="Sin procedencia registrada"
              text="Aparecen aquí las visitas que llegan desde otro sitio: Instagram, Google, un enlace compartido. Quien escribe la dirección a mano o entra desde WhatsApp suele venir sin procedencia."
            />
          ) : (
            <ul className="space-y-2.5">
              {topReferrers.map((r) => (
                <li
                  key={r.referrer}
                  className="flex items-center justify-between gap-3 rounded-xl bg-roa-950 px-4 py-2.5"
                >
                  <span className="truncate text-sm text-cream/80">{r.referrer}</span>
                  <span className="shrink-0 font-display text-lg text-roa-300">
                    {r._count._all}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <p className="mt-6 text-xs text-cream/35">
        Solo se contabiliza la pantalla de espera. No se guardan direcciones IP
        ni datos del dispositivo: cada navegador recibe un identificador
        aleatorio propio, que únicamente sirve para distinguir personas. Las
        visitas hechas con la cookie de vista previa del equipo quedan fuera de
        todos estos números.
      </p>
    </>
  );
}
