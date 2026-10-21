import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EventoPedido from "@/components/evento/EventoPedido";
import EventoGaleria from "@/components/evento/EventoGaleria";
import { PinIcon, CalendarIcon } from "@/components/Icons";
import { getEvento } from "@/lib/evento";
import {
  eventoPublicado,
  getSettings,
  pedidosEventoActivos,
  preciosEventoVisibles,
} from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  if (!eventoPublicado(settings)) return { title: "Evento" };

  const donde = [settings.eventPlace, settings.eventDate].filter(Boolean).join(" · ");

  return {
    title: settings.eventTitle,
    description: donde || settings.eventNote || "La carta de Roa Brew en el evento.",
    // La página cambia con cada feria y no vale la pena indexarla: para
    // cuando Google la rastree, el evento ya pasó.
    robots: { index: false, follow: true },
    openGraph: {
      title: settings.eventTitle,
      description: donde || settings.eventNote || "",
      images: settings.eventPosterUrl ? [settings.eventPosterUrl] : undefined,
    },
  };
}

export default async function EventoPage() {
  const settings = await getSettings();

  // Apagada responde 404 y no una página vacía: una feria que ya pasó, o a
  // medio armar, es peor que no tener página.
  if (!eventoPublicado(settings)) notFound();

  const { productos, fotos } = await getEvento();
  const afiche = settings.eventPosterUrl.trim();
  const conPrecios = preciosEventoVisibles(settings);
  const sePuedePedir = pedidosEventoActivos(settings);

  return (
    <div className="bg-roa-500">
      {/* ── Portada ── */}
      <section className="grain relative overflow-hidden px-5 pb-16 pt-32 text-center sm:pt-40">
        <div className="glow pointer-events-none absolute -left-40 top-0 h-[30rem] w-[30rem] opacity-50" />

        <div className="relative mx-auto max-w-3xl">
          <h1 className="font-display text-[clamp(2.4rem,7vw,4.5rem)] leading-[0.95] text-cream">
            {settings.eventTitle}
          </h1>

          {/* La barra: es lo que la gente reconoce del Pop Up */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/barra-evento.webp"
            alt="La barra de Roa Brew montada en el evento"
            className="mx-auto mt-8 w-full max-w-xl animate-float-slow"
            // La primera imagen de la página: sin lazy, para que no llegue
            // tarde justo en la pantalla que el cliente ve primero
            fetchPriority="high"
          />

          <p className="mt-6 font-hand text-[clamp(1.8rem,5vw,2.8rem)] leading-none text-grape">
            {settings.eventKicker}
          </p>

          {(settings.eventPlace || settings.eventDate) && (
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              {settings.eventPlace && (
                <span className="flex items-center gap-2 rounded-full border-2 border-ink bg-cream px-5 py-2.5 font-bold text-ink">
                  <PinIcon className="h-4 w-4" />
                  {settings.eventPlace}
                </span>
              )}
              {settings.eventDate && (
                <span className="flex items-center gap-2 rounded-full border-2 border-ink bg-mango px-5 py-2.5 font-bold text-ink">
                  <CalendarIcon className="h-4 w-4" />
                  {settings.eventDate}
                </span>
              )}
            </div>
          )}

          {settings.eventNote && (
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cream/85">
              {settings.eventNote}
            </p>
          )}
        </div>
      </section>

      {/* ── Afiche ── */}
      {afiche && (
        <section className="mx-auto w-full max-w-3xl px-5 pb-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afiche}
            alt={settings.eventPosterAlt || "Afiche del evento"}
            className="w-full rounded-3xl border-2 border-ink shadow-[7px_7px_0_var(--color-ink)]"
          />
        </section>
      )}

      {/* ── La carta ── */}
      <section className="bg-roa-900 py-14">
        <div className="mx-auto w-full max-w-7xl px-5">
          <h2 className="font-display text-[clamp(1.8rem,5vw,3rem)] leading-none text-cream">
            {settings.eventMenuTitle}
          </h2>

          {productos.length === 0 ? (
            <p className="mt-5 text-cream/50">
              Todavía no cargamos la carta de este evento.
            </p>
          ) : (
            // Las tarjetas y el pedido van juntos en un componente de cliente:
            // las cantidades viven en la tarjeta y en la barra de abajo a la
            // vez, y separarlos obligaría a levantar ese estado igual
            <EventoPedido
              productos={productos}
              currency={settings.currency}
              mostrarPrecio={conPrecios}
              permitePedir={sePuedePedir}
            />
          )}
        </div>

        <EventoGaleria fotos={fotos} titulo={settings.eventGalleryTitle} />
      </section>
    </div>
  );
}
