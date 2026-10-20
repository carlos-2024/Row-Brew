import ProductArt from "@/components/ProductArt";
import type { EventoProducto } from "@/lib/evento";

const BADGES: Record<string, { text: string; className: string }> = {
  nuevo: { text: "NUEVO", className: "bg-mango text-ink -rotate-6" },
  estrella: { text: "★ TOP", className: "bg-grape text-ink rotate-6" },
};

/**
 * Tarjeta de la carta del evento.
 *
 * Es la misma cara que la tarjeta de la carta —crema, borde grueso, sombra
 * dura, la ilustración que sale del nombre— pero sin el botón de agregar: en
 * una feria se pide en la barra, no por la web, y un carrito a medio llenar
 * que nadie va a enviar solo confunde.
 *
 * Por eso tampoco es un componente de cliente: no hay nada que reaccione.
 */
export default function EventoCard({
  producto,
  currency,
}: {
  producto: EventoProducto;
  currency: string;
}) {
  const badge = producto.badge ? BADGES[producto.badge] : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border-2 border-ink bg-cream text-ink shadow-[5px_5px_0_var(--color-ink)]">
      <div className="relative grid place-items-center bg-gradient-to-b from-roa-200 to-roa-100 py-6">
        {badge && (
          <span
            className={`absolute left-3 top-3 rounded-full border-2 border-ink px-3 py-1 text-[11px] font-black tracking-wide ${badge.className}`}
          >
            {badge.text}
          </span>
        )}

        {producto.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={producto.imageUrl}
            alt={producto.name}
            className="h-40 w-auto object-contain"
            loading="lazy"
          />
        ) : (
          <ProductArt
            name={producto.name}
            categorySlug={producto.categorySlug}
            kind={producto.kind}
            temperature={producto.temperature}
            className="h-40"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl leading-tight">{producto.name}</h3>
        {producto.description && (
          <p className="mt-1.5 text-sm leading-snug text-ink/60">
            {producto.description}
          </p>
        )}
        {/* mt-auto: los precios quedan alineados aunque las descripciones
            tengan distinto largo */}
        <p className="mt-auto pt-3 font-display text-2xl leading-none">
          {currency} {producto.price.toFixed(2)}
        </p>
      </div>
    </article>
  );
}
