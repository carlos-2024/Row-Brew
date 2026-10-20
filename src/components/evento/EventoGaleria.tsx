import type { EventoFoto } from "@/lib/evento";

/**
 * Carrusel de fotos del evento.
 *
 * Se mueve con el dedo y no solo: en la feria la gente mira el carrusel con
 * el celular en la mano, y un carrusel que avanza cuando quiere se lleva la
 * foto que estabas viendo.
 *
 * Es scroll nativo con puntos de anclaje, sin JavaScript. Así arrastra con el
 * dedo, con la rueda, con el trackpad y con el teclado sin que haya que
 * programar ninguno de esos casos.
 */
export default function EventoGaleria({
  fotos,
  titulo,
}: {
  fotos: EventoFoto[];
  titulo: string;
}) {
  if (fotos.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-14">
      <h2 className="font-display text-[clamp(1.8rem,5vw,3rem)] leading-none text-cream">
        {titulo}
      </h2>

      {/* -mx-5 + px-5: las fotos entran y salen pegadas al borde de la
          pantalla, pero la primera y la última respetan el margen.
          overscroll-x-contain: al llegar al final el gesto no se contagia a
          la página, que es lo que dejaba ver una franja negra al costado. */}
      <div className="no-scrollbar overscroll-x-contain -mx-5 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-4">
        {fotos.map((f) => (
          <figure
            key={f.id}
            className="w-[80vw] max-w-sm shrink-0 snap-start sm:w-[22rem]"
          >
            <div className="overflow-hidden rounded-3xl border-2 border-ink bg-roa-900 shadow-[5px_5px_0_var(--color-ink)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.url}
                alt={f.caption ?? ""}
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
            </div>
            {f.caption && (
              <figcaption className="mt-2.5 px-1 text-sm leading-snug text-cream/60">
                {f.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
