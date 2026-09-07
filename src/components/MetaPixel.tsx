"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

/**
 * Identificador del pixel de Roa Brew.
 *
 * No es un secreto: viaja en el código de cualquier página y se puede leer
 * desde el navegador. Se deja acá y no en una variable de entorno para que el
 * despliegue no dependa de configurar nada aparte.
 */
const PIXEL_ID = "1091910790032920";

/**
 * Rutas que no se miden.
 *
 * El panel es tráfico del equipo, no de clientes: contarlo ensuciaría las
 * audiencias de remarketing con las visitas de quienes administran la carta.
 */
const SIN_MEDIR = ["/admin"];

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Meta Pixel.
 *
 * El código que entrega Meta está pensado para sitios que recargan la página
 * entera en cada clic. Acá la navegación es del lado del cliente: el navegador
 * no vuelve a cargar nada, así que ese `track('PageView')` del arranque se
 * ejecutaría una sola vez en toda la sesión y solo se registraría la primera
 * pantalla que abrió el visitante.
 *
 * Por eso el disparo va en dos partes: el fragmento original registra la
 * primera vista, y el efecto de abajo registra las siguientes al cambiar de
 * ruta. La primera se salta a propósito, o quedaría duplicada.
 */
export default function MetaPixel() {
  const pathname = usePathname();
  const ultima = useRef<string | null>(null);

  const medir = !SIN_MEDIR.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!medir) return;

    // La primera vista ya la registró el fragmento de arranque. Además, en
    // desarrollo React monta dos veces, y esta misma guarda lo cubre.
    if (ultima.current === null) {
      ultima.current = pathname;
      return;
    }
    if (ultima.current === pathname) return;
    ultima.current = pathname;

    window.fbq?.("track", "PageView");
  }, [pathname, medir]);

  if (!medir) return null;

  return (
    <>
      {/* afterInteractive: se carga en cuanto la página es usable, sin
          retrasar lo que el visitante vino a ver. El id evita que Next lo
          inyecte más de una vez, y el propio fragmento comprueba `f.fbq`
          antes de inicializar, así que no hay forma de contarlo doble. */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>

      {/* Respaldo para quien navega sin JavaScript */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
