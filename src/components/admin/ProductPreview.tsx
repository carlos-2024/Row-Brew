"use client";

import { useEffect, useRef, useState } from "react";
import ProductArt from "@/components/ProductArt";

type CategoriaPreview = { id: string; slug: string; kind: string };

type Valores = {
  name: string;
  categoryId: string;
  temperature: string;
  imageUrl: string;
};

/**
 * Vista previa del producto que se actualiza mientras se edita.
 *
 * El formulario es de servidor, así que en vez de convertirlo entero en uno de
 * cliente, este componente escucha los cambios del <form> que lo contiene.
 * Basta con que los campos lleven su `name`: no hay que cablear cada uno.
 *
 * Antes la vista previa mostraba lo último guardado, así que cambiar la
 * temperatura o el nombre no se veía hasta guardar — justo cuando uno quiere
 * ver cómo va a quedar antes de decidirse.
 */
export default function ProductPreview({
  categories,
  initial,
}: {
  categories: CategoriaPreview[];
  initial: Valores;
}) {
  const ancla = useRef<HTMLDivElement>(null);
  const [v, setV] = useState<Valores>(initial);

  useEffect(() => {
    const form = ancla.current?.closest("form");
    if (!form) return;

    const leer = () => {
      const fd = new FormData(form);
      setV({
        name: String(fd.get("name") ?? ""),
        categoryId: String(fd.get("categoryId") ?? ""),
        temperature: String(fd.get("temperature") ?? "frio"),
        imageUrl: String(fd.get("imageUrl") ?? ""),
      });
    };

    // input para lo que se escribe, change para los desplegables y radios
    form.addEventListener("input", leer);
    form.addEventListener("change", leer);
    return () => {
      form.removeEventListener("input", leer);
      form.removeEventListener("change", leer);
    };
  }, []);

  const categoria = categories.find((c) => c.id === v.categoryId) ?? categories[0];
  const nombre = v.name.trim() || "Nueva bebida";
  const foto = v.imageUrl.trim();
  const caliente = v.temperature === "caliente";
  const esBebida = (categoria?.kind ?? "bebida") === "bebida";

  return (
    <div ref={ancla}>
      <div className="relative grid place-items-center overflow-hidden rounded-3xl bg-gradient-to-b from-roa-200 to-roa-100 py-8">
        {esBebida && (
          <span
            className={`absolute left-3 top-3 rounded-full border-2 border-ink px-3 py-1 text-xs font-black uppercase tracking-wide ${
              caliente ? "bg-mango text-ink" : "bg-cream text-ink"
            }`}
          >
            {caliente ? "Caliente" : "Frío"}
          </span>
        )}

        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={foto} alt={nombre} className="h-52 w-auto object-contain" />
        ) : (
          <ProductArt
            // key: al cambiar la temperatura se remonta, así el vapor arranca
            // su animación desde el principio en vez de aparecer a mitad
            key={v.temperature}
            name={nombre}
            categorySlug={categoria?.slug ?? "sparkling-tea"}
            kind={categoria?.kind ?? "bebida"}
            temperature={v.temperature}
            className="h-52"
          />
        )}
      </div>

      <p className="mt-3 text-center font-display text-lg text-cream">{nombre}</p>

      <p className="mt-3 text-sm text-cream/45">
        {foto
          ? "Se muestra la foto cargada. Bórrala para ver la ilustración."
          : caliente && esBebida
            ? "Caliente: vaso de papel con vapor, sin hielo ni sorbete. La faja lleva los colores del sabor."
            : "La ilustración sale del nombre y la familia: si menciona mango, fresa, taro o matcha, cambian los colores."}
      </p>
    </div>
  );
}
