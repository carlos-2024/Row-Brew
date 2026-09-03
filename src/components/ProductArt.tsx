import CupArt from "@/components/CupArt";
import PlateArt from "@/components/PlateArt";

/**
 * Dibuja un producto según lo que sea: vaso para bebidas, plato para comidas
 * y postres.
 *
 * Existe para que la decisión viva en un solo lugar. Las tarjetas, el carrito
 * y el ticket del pedido solo dicen qué producto es; cuál de los dos dibujos
 * corresponde se resuelve acá.
 */
export default function ProductArt({
  name,
  categorySlug,
  kind = "bebida",
  className = "",
  animated = true,
}: {
  name: string;
  categorySlug: string;
  /** bebida | comida | postre. Por defecto bebida: es lo que había antes. */
  kind?: string;
  className?: string;
  animated?: boolean;
}) {
  if (kind === "comida" || kind === "postre") {
    return <PlateArt name={name} kind={kind} className={className} />;
  }

  return (
    <CupArt
      name={name}
      categorySlug={categorySlug}
      className={className}
      animated={animated}
    />
  );
}
