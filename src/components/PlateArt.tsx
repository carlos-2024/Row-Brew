"use client";

import { useId } from "react";
import { C } from "@/components/CupArt";

/**
 * Ilustración generativa de comidas y postres.
 *
 * El mismo papel que cumple `CupArt` con las bebidas: mientras no haya foto
 * cargada, el producto se dibuja solo. Se separó en otro archivo porque un
 * vaso no sirve para un cheesecake, y forzar las dos formas en un mismo
 * componente terminaba en una maraña de condicionales.
 *
 * Se mantiene el mismo lienzo (120×168) y el mismo contorno grueso que los
 * vasos para que la carta se vea de una sola pieza.
 */

const OUTLINE = "#0c100b";

function has(name: string, ...words: string[]): boolean {
  const n = name.toLowerCase();
  return words.some((w) => n.includes(w));
}

/** Color que sugiere el nombre. Cae en algo neutro y comestible si no acierta. */
function sabor(name: string, porDefecto: string): string {
  if (has(name, "chocolate", "brownie", "cacao", "oreo")) return "#4A2C1B";
  if (has(name, "matcha", "verde")) return C.matcha;
  if (has(name, "fresa", "strawberry", "frutilla")) return C.strawberry;
  if (has(name, "arándano", "arandano", "blueberry", "mora")) return C.blueberry;
  if (has(name, "mango", "maracuyá", "maracuya")) return C.mango;
  if (has(name, "limón", "limon", "lemon")) return C.lemon;
  if (has(name, "lúcuma", "lucuma", "durazno", "melocotón")) return C.peach;
  if (has(name, "taro", "ube", "morado")) return C.taro;
  if (has(name, "pistacho", "pistachio")) return C.pistachio;
  if (has(name, "caramelo", "caramel", "manjar", "toffee")) return C.caramel;
  if (has(name, "queso", "cheese", "vainilla")) return C.milk;
  return porDefecto;
}

/** Plato: la base común de comidas y postres, para que se vean hermanados. */
function Plato() {
  return (
    <>
      <ellipse cx="60" cy="140" rx="46" ry="10" fill="#ffffff" opacity="0.1" />
      <path
        d="M16 138a44 10 0 0 0 88 0"
        fill="none"
        stroke={OUTLINE}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <ellipse
        cx="60"
        cy="138"
        rx="44"
        ry="9"
        fill="none"
        stroke={OUTLINE}
        strokeWidth="3.5"
      />
    </>
  );
}

/**
 * Postre: una porción de torta vista de lado, con sus capas.
 *
 * Se dibuja de perfil y no desde arriba porque las capas son lo que distingue
 * un cheesecake de un brownie, y desde arriba no se verían.
 */
function Postre({ name, uid }: { name: string; uid: string }) {
  const relleno = sabor(name, C.milk);
  const cobertura = sabor(name, C.strawberry);
  const esGalleta = has(name, "galleta", "cookie", "brownie", "alfajor");

  if (esGalleta) {
    return (
      <>
        <Plato />
        <g>
          <circle cx="60" cy="106" r="34" fill={relleno} />
          <circle
            cx="60"
            cy="106"
            r="34"
            fill="none"
            stroke={OUTLINE}
            strokeWidth="3.5"
          />
          {/* Chispas, siempre en el mismo sitio: no deben bailar entre recargas */}
          <g fill={OUTLINE} opacity="0.85">
            <circle cx="48" cy="96" r="4" />
            <circle cx="70" cy="99" r="3.4" />
            <circle cx="58" cy="112" r="4.2" />
            <circle cx="74" cy="118" r="3" />
            <circle cx="44" cy="115" r="3.2" />
          </g>
          <path
            d="M40 92a22 22 0 0 1 16-12"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.5"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      </>
    );
  }

  return (
    <>
      <Plato />
      <defs>
        <clipPath id={`porcion-${uid}`}>
          <path d="M30 132V78l30-24 30 24v54H30Z" />
        </clipPath>
      </defs>

      <g clipPath={`url(#porcion-${uid})`}>
        <rect x="28" y="52" width="64" height="82" fill={relleno} />
        {/* Bizcocho: las bandas oscuras que separan las capas de crema */}
        <rect x="28" y="92" width="64" height="12" fill={OUTLINE} opacity="0.22" />
        <rect x="28" y="116" width="64" height="10" fill={OUTLINE} opacity="0.16" />
        {/* Base de galleta molida */}
        <rect x="28" y="126" width="64" height="8" fill={C.caramel} opacity="0.85" />
      </g>

      {/* Cobertura que escurre por el borde superior */}
      <path
        d="M30 78 60 54l30 24v6c-6 4-9-3-15 1s-9 5-15 1-9-4-15 0-9 4-15-1v-7Z"
        fill={cobertura}
      />

      <path
        d="M30 132V78l30-24 30 24v54H30Z"
        fill="none"
        stroke={OUTLINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Cereza */}
      <circle cx="60" cy="48" r="7" fill={C.strawberry} />
      <circle cx="60" cy="48" r="7" fill="none" stroke={OUTLINE} strokeWidth="3" />
      <path
        d="M60 41c1-6 5-8 9-8"
        fill="none"
        stroke={OUTLINE}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  );
}

/**
 * Comida: un sándwich de pan de molde, o un croissant si el nombre lo pide.
 *
 * Son las dos siluetas que cubren casi toda la carta salada de una cafetería;
 * cualquier otra cosa cae en el sándwich, que es la más neutra.
 */
function Comida({ name }: { name: string }) {
  const esCroissant = has(name, "croissant", "medialuna", "cuernito");
  const relleno = sabor(name, "#E8B45A");

  if (esCroissant) {
    return (
      <>
        <Plato />
        <g>
          <path
            d="M22 122c0-26 17-46 38-46s38 20 38 46c-10-8-16-16-24-16s-10 10-14 10-6-10-14-10-14 8-24 16Z"
            fill={C.caramel}
          />
          <path
            d="M22 122c0-26 17-46 38-46s38 20 38 46c-10-8-16-16-24-16s-10 10-14 10-6-10-14-10-14 8-24 16Z"
            fill="none"
            stroke={OUTLINE}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Pliegues */}
          <g stroke={OUTLINE} strokeWidth="2.6" strokeLinecap="round" opacity="0.55">
            <path d="M46 84c-3 10-3 20 0 28" fill="none" />
            <path d="M60 80v32" fill="none" />
            <path d="M74 84c3 10 3 20 0 28" fill="none" />
          </g>
          <path
            d="M38 92a26 26 0 0 1 12-12"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.45"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      </>
    );
  }

  return (
    <>
      <Plato />
      {/* Pan de abajo */}
      <path d="M26 118h68v10a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6v-10Z" fill={C.caramel} />
      {/* Relleno */}
      <path d="M24 106h72v12H24z" fill={relleno} />
      {/* Lechuga: el borde ondulado que hace legible que es un sándwich */}
      <path
        d="M22 106c6-7 10 3 16-3s10 4 16-2 10 5 16-1 10 4 16 0v6H22v0Z"
        fill={C.pistachio}
      />
      {/* Pan de arriba, con su domo */}
      <path d="M26 104a34 26 0 0 1 68 0v2H26v-2Z" fill="#E8B45A" />

      <g fill="none" stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round">
        <path d="M26 104a34 26 0 0 1 68 0v2H26v-2Z" />
        <path d="M24 106h72v12H24z" />
        <path d="M26 118h68v10a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6v-10Z" />
      </g>

      {/* Ajonjolí */}
      <g fill={OUTLINE} opacity="0.7">
        <ellipse cx="48" cy="90" rx="3" ry="2" transform="rotate(-18 48 90)" />
        <ellipse cx="62" cy="85" rx="3" ry="2" transform="rotate(8 62 85)" />
        <ellipse cx="76" cy="92" rx="3" ry="2" transform="rotate(22 76 92)" />
      </g>
    </>
  );
}

export default function PlateArt({
  name,
  kind,
  className = "",
}: {
  name: string;
  /** "postre" dibuja una porción o galleta; cualquier otra cosa, comida salada */
  kind: string;
  className?: string;
}) {
  // Único por instancia: el mismo postre se dibuja en el carrusel y en la
  // grilla, y dos clipPath con el mismo id no resuelven bien
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 120 168"
      className={className}
      role="img"
      aria-label={`Ilustración de ${name}`}
    >
      {kind === "postre" ? <Postre name={name} uid={uid} /> : <Comida name={name} />}
    </svg>
  );
}
