import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EventoBienvenida from "@/components/evento/EventoBienvenida";
import EventoPedido from "@/components/evento/EventoPedido";
import EventoGaleria from "@/components/evento/EventoGaleria";
import { PinIcon, CalendarIcon } from "@/components/Icons";
import { getEvento } from "@/lib/evento";
import {
  eventoPublicado,
  getSettings,
  pedidosEventoActivos,
  preciosEventoVisibles,
  segundosBienvenidaEvento,
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
  const bienvenida = segundosBienvenidaEvento(settings);

  return (
    // Vive fuera del layout del sitio a propósito: sin cabecera, sin pie, sin
    // carrito flotante y sin los adornos de temporada. En una feria la
    // pantalla es un celular prestado a medio metro de la barra, y cada cosa
    // que no sea la carta es una distracción —o un camino a otra página.
    //
    // min-h-dvh porque ya no hay un <main> arriba que estire el fondo.
    <main className="min-h-dvh bg-roa-500">
      {/* La barra y el título solo se ven al entrar: a los pocos segundos se
          apartan y dejan la carta, que es a lo que se viene. */}
      {bienvenida > 0 && (
        <EventoBienvenida
          titulo={settings.eventTitle}
          kicker={settings.eventKicker}
          segundos={bienvenida}
        />
      )}

      {/* ── Encabezado: dónde, cuándo y la nota ── */}
      {/* Compacto a propósito: lo vistoso ya pasó en la bienvenida, y esto es
          información que conviene tener a mano mientras se mira la carta. */}
      <section className="grain relative overflow-hidden px-5 pb-10 pt-10 text-center">
        <div className="glow pointer-events-none absolute -left-40 top-0 h-[30rem] w-[30rem] opacity-50" />

        <div className="relative mx-auto max-w-3xl">
          <h1 className="font-display text-[clamp(1.9rem,5vw,3rem)] leading-none text-cream">
            {settings.eventTitle}
          </h1>
          <p className="mt-2 font-hand text-[clamp(1.4rem,4vw,2rem)] leading-none text-grape">
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
    </main>
  );
}
