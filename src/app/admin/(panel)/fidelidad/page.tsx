import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import {
  LOYALTY_GOAL,
  LOYALTY_MID_GOAL,
  loyaltyStatus,
  normalizeDni,
} from "@/lib/loyalty";
import {
  addLoyaltyStamp,
  removeLoyaltyStamp,
  redeemMidReward,
  redeemFullReward,
  redeemBirthdayReward,
  createLoyaltyCustomer,
  deleteLoyaltyCustomer,
} from "@/app/admin/actions";
import {
  AdminHeader,
  Button,
  EmptyState,
  Field,
  Panel,
  StatCard,
  inputClass,
} from "@/components/admin/ui";
import { SearchIcon, CakeIcon } from "@/components/Icons";
import { KodaMark } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function FidelidadPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const where = query
    ? {
        OR: [
          { dni: { contains: normalizeDni(query) } },
          { name: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const mesActual = new Date().getUTCMonth() + 1;

  const [customers, total, conPremio, sellosMes, cumpleMes] = await Promise.all([
    prisma.loyaltyCustomer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 60,
      include: {
        events: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.loyaltyCustomer.count(),
    prisma.loyaltyCustomer.count({ where: { stamps: { gte: LOYALTY_MID_GOAL } } }),
    prisma.loyaltyEvent.aggregate({
      where: {
        type: "SELLO",
        createdAt: { gte: new Date(new Date().setDate(1)) },
      },
      _sum: { quantity: true },
    }),
    // Prisma no filtra por mes de una fecha, así que va en SQL directo
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "LoyaltyCustomer"
      WHERE EXTRACT(MONTH FROM "birthday") = ${mesActual}
    `,
  ]);

  return (
    <>
      <AdminHeader kicker="clientes" title="Fidelidad" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clientes registrados" value={total} tone="green" />
        <StatCard
          label="Con premio disponible"
          value={conPremio}
          tone={conPremio > 0 ? "mango" : "cream"}
          hint={`${LOYALTY_MID_GOAL}+ sellos`}
        />
        <StatCard
          label="Sellos este mes"
          value={sellosMes._sum.quantity ?? 0}
          tone="grape"
        />
        <StatCard
          label="Cumpleaños este mes"
          value={Number(cumpleMes[0]?.count ?? 0)}
          tone="cream"
          hint="Buen momento para escribirles"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_21rem]">
        <div>
          {/* Buscador */}
          <form method="get" className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <input
                name="q"
                defaultValue={query}
                placeholder="Busca por DNI o nombre…"
                className={`${inputClass} pl-11`}
              />
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cream/40" />
            </div>
            <Button variant="primary">Buscar</Button>
            {query && (
              <Link
                href="/admin/fidelidad"
                className="rounded-full border-2 border-cream/25 px-5 py-2.5 font-bold text-cream transition hover:bg-cream/10"
              >
                Limpiar
              </Link>
            )}
          </form>

          {customers.length === 0 ? (
            <EmptyState
              title={query ? "Sin resultados" : "Aún no hay clientes"}
              text={
                query
                  ? `No encontramos a nadie con “${query}”.`
                  : "Registra al primero desde el formulario de la derecha, o deja que se registren solos desde la página de fidelidad."
              }
            />
          ) : (
            <div className="space-y-3">
              {customers.map((c) => {
                const s = loyaltyStatus(c);
                return (
                  <Panel key={c.id} className={c.active ? "" : "opacity-50"}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-2xl text-cream">{c.name}</p>
                        <p className="text-sm text-cream/45">
                          DNI {c.dni}
                          {c.phone ? ` · ${c.phone}` : " · sin WhatsApp"}
                          {s.birthday ? ` · cumple ${s.birthday}` : " · sin cumpleaños"}
                        </p>
                        {c.events[0] && (
                          <p className="mt-1 text-xs text-cream/35">
                            Último movimiento: {formatDate(c.events[0].createdAt)}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="font-display text-3xl leading-none text-roa-300">
                          {s.stamps}
                          <span className="text-xl text-cream/25">/{s.goal}</span>
                        </p>
                        <p className="text-xs text-cream/40">
                          {c.cycles} completadas · {c.totalStamps} de por vida
                        </p>
                      </div>
                    </div>

                    {/* Sellos en miniatura */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {Array.from({ length: s.goal }, (_, i) => i + 1).map((n) => {
                        const filled = n <= s.stamps;
                        const isMid = n === s.midGoal;
                        const isFinal = n === s.goal;
                        return (
                          <span
                            key={n}
                            title={
                              isFinal ? "Bebida gratis" : isMid ? "Cortesía" : undefined
                            }
                            className={`grid h-8 w-8 place-items-center rounded-lg border-2 text-[10px] font-bold ${
                              filled
                                ? "border-roa-400 bg-roa-500 text-cream"
                                : isFinal
                                  ? "border-mango/60 text-mango"
                                  : isMid
                                    ? "border-grape/60 text-grape"
                                    : "border-cream/12 text-cream/25"
                            }`}
                          >
                            {filled ? <KodaMark className="h-4 w-4" /> : n}
                          </span>
                        );
                      })}
                    </div>

                    {/* Avisos de premio */}
                    {(s.midAvailable || s.fullAvailable || s.isBirthdayWeek) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {s.birthdayAvailable && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-berry px-3 py-1 text-xs font-black text-cream">
                            <CakeIcon className="h-4 w-4" />
                            CUMPLEAÑOS — BEBIDA DE REGALO
                          </span>
                        )}
                        {s.isBirthdayWeek && !s.birthdayAvailable && (
                          <span className="rounded-full border-2 border-cream/25 px-3 py-1 text-xs font-black text-cream/45">
                            CUMPLEAÑOS YA CANJEADO ESTE AÑO
                          </span>
                        )}
                        {s.fullAvailable && (
                          <span className="rounded-full border-2 border-ink bg-mango px-3 py-1 text-xs font-black text-ink">
                            ★ BEBIDA GRATIS DISPONIBLE
                          </span>
                        )}
                        {s.midAvailable && (
                          <span className="rounded-full border-2 border-ink bg-grape px-3 py-1 text-xs font-black text-ink">
                            AGRANDADO / CORTESÍA DISPONIBLE
                          </span>
                        )}
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t-2 border-cream/8 pt-4">
                      <form action={addLoyaltyStamp}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="quantity" value="1" />
                        <Button
                          variant="primary"
                          className="!px-5"
                          disabled={s.fullAvailable}
                        >
                          + 1 sello
                        </Button>
                      </form>

                      <form action={addLoyaltyStamp}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="quantity" value="2" />
                        <Button
                          variant="ghost"
                          className="!px-4 !py-2 !text-sm"
                          disabled={s.fullAvailable}
                        >
                          + 2
                        </Button>
                      </form>

                      <form action={removeLoyaltyStamp}>
                        <input type="hidden" name="id" value={c.id} />
                        <Button variant="ghost" className="!px-4 !py-2 !text-sm">
                          − 1
                        </Button>
                      </form>

                      <span className="mx-1 h-6 w-px bg-cream/12" />

                      <form action={redeemMidReward}>
                        <input type="hidden" name="id" value={c.id} />
                        <Button
                          variant="ghost"
                          className="!px-4 !py-2 !text-sm"
                          disabled={!s.midAvailable}
                        >
                          Canjear cortesía
                        </Button>
                      </form>

                      <form action={redeemFullReward}>
                        <input type="hidden" name="id" value={c.id} />
                        <Button
                          variant="ghost"
                          className="!px-4 !py-2 !text-sm"
                          disabled={!s.fullAvailable}
                        >
                          Canjear bebida gratis
                        </Button>
                      </form>

                      <form action={redeemBirthdayReward}>
                        <input type="hidden" name="id" value={c.id} />
                        <Button
                          variant="ghost"
                          className="!px-4 !py-2 !text-sm"
                          disabled={!s.birthdayAvailable}
                        >
                          Canjear cumpleaños
                        </Button>
                      </form>

                      <form action={deleteLoyaltyCustomer} className="ml-auto">
                        <input type="hidden" name="id" value={c.id} />
                        <Button variant="danger" className="!px-4 !py-2 !text-sm">
                          Eliminar
                        </Button>
                      </form>
                    </div>

                    {s.fullAvailable && (
                      <p className="mt-3 text-xs text-mango">
                        Tarjeta llena: no admite más sellos hasta que canjees la bebida
                        gratis. Al canjear se reinicia a cero.
                      </p>
                    )}
                  </Panel>
                );
              })}
            </div>
          )}
        </div>

        {/* Registro manual */}
        <Panel title="Registrar cliente" className="h-fit xl:sticky xl:top-6">
          <form action={createLoyaltyCustomer} className="space-y-4">
            <Field label="Documento" hint="DNI de 8 dígitos o carné de extranjería">
              <input
                name="dni"
                required
                inputMode="numeric"
                maxLength={12}
                placeholder="12345678"
                className={inputClass}
              />
            </Field>
            <Field label="Nombre">
              <input
                name="name"
                required
                placeholder="Nombre y apellido"
                className={inputClass}
              />
            </Field>
            <Field label="WhatsApp">
              <input
                name="phone"
                required
                inputMode="tel"
                placeholder="999 999 999"
                className={inputClass}
              />
            </Field>
            <Field label="Fecha de nacimiento" hint="Activa su premio de cumpleaños">
              <input
                name="birthday"
                type="date"
                required
                max={new Date().toISOString().slice(0, 10)}
                className={inputClass}
              />
            </Field>
            <Field label="Notas (opcional)">
              <textarea
                name="notes"
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </Field>
            <Button variant="primary" className="w-full">
              Crear tarjeta
            </Button>
          </form>

          <p className="mt-5 border-t-2 border-cream/8 pt-4 text-xs text-cream/40">
            Los clientes también pueden crear su tarjeta solos desde{" "}
            <Link href="/fidelidad" target="_blank" className="text-roa-300 underline">
              la página de fidelidad
            </Link>
            . Los sellos siempre se cargan desde acá.
          </p>
        </Panel>
      </div>
    </>
  );
}
