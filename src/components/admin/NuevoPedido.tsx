"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BellIcon, BellOffIcon, ReceiptIcon } from "@/components/Icons";
import { intervaloDeFondo } from "@/lib/intervaloDeFondo";

/** Cada cuánto se pregunta si entró un pedido. */
const CADA = 15000;

const MEMORIA = "roa_aviso_pedidos";

type Ultimo = { id: string; code: string; nombre: string; tipo: string };

/**
 * Campanita de pedidos nuevos.
 *
 * Suena en cualquier pantalla del panel: quien atiende suele tenerlo abierto
 * en Productos o en Fidelidad, no mirando la lista de pedidos.
 *
 * El sonido se genera con el propio navegador en vez de cargar un archivo.
 * Así no hay un mp3 que pese, que tarde en llegar la primera vez o que falte
 * si el disco del servidor se llena; y el tono se afina desde el código.
 *
 * Hace falta que alguien encienda el aviso a mano: los navegadores no dejan
 * que una página suene sola antes de que la toquen, y un botón que no suena
 * es peor que no tenerlo. Queda encendido en ese equipo hasta que lo apaguen.
 */
export default function NuevoPedido({ pendingCount }: { pendingCount: number }) {
  const router = useRouter();
  const [activo, setActivo] = useState(false);
  const [aviso, setAviso] = useState<Ultimo | null>(null);

  const audio = useRef<AudioContext | null>(null);
  /** El último pedido que ya vimos: con esto se sabe si el de ahora es nuevo */
  const visto = useRef<string | null>(null);
  const activoRef = useRef(false);

  useEffect(() => {
    activoRef.current = activo;
  }, [activo]);

  useEffect(() => {
    try {
      setActivo(window.localStorage.getItem(MEMORIA) === "1");
    } catch {
      /* navegación privada o almacenamiento bloqueado: queda apagado */
    }
  }, []);

  /**
   * Aviso del sistema operativo: el que aparece encima de lo que estés usando
   * aunque el navegador esté minimizado, y se queda en el centro de
   * notificaciones hasta que alguien lo toque.
   *
   * Solo se lanza con la pestaña de fondo. Si el panel está a la vista el
   * aviso de la propia página ya se ve, y duplicarlo molesta.
   */
  const notificar = useCallback((p: Ultimo) => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    if (document.visibilityState === "visible") return;

    try {
      const n = new Notification("¡Pedido nuevo en Roa Brew!", {
        body: `${p.nombre} · ${p.code}`,
        // El id del pedido: dos pedidos distintos no se tapan entre sí, pero
        // un mismo pedido nunca aparece dos veces
        tag: p.id,
        // Un pedido no se atiende solo: el aviso espera a que alguien lo vea
        requireInteraction: true,
      });
      n.onclick = () => {
        window.focus();
        window.location.href = "/admin/pedidos";
        n.close();
      };
    } catch {
      /* algunos navegadores solo la permiten desde un service worker */
    }
  }, []);

  /** Dos notas cortas, como el timbre de una caja registradora. */
  const sonar = useCallback(() => {
    const ctx = audio.current;
    if (!ctx) return;
    // Al volver de una pestaña en segundo plano el contexto queda suspendido
    if (ctx.state === "suspended") void ctx.resume();

    const ahora = ctx.currentTime;
    [
      { hz: 880, en: 0 },
      { hz: 1320, en: 0.14 },
    ].forEach(({ hz, en }) => {
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = hz;

      // La subida rápida y la caída larga son lo que suena a campana y no a
      // pitido; sin ellas el corte seco produce un chasquido
      vol.gain.setValueAtTime(0.0001, ahora + en);
      vol.gain.exponentialRampToValueAtTime(0.3, ahora + en + 0.01);
      vol.gain.exponentialRampToValueAtTime(0.0001, ahora + en + 0.45);

      osc.connect(vol).connect(ctx.destination);
      osc.start(ahora + en);
      osc.stop(ahora + en + 0.5);
    });
  }, []);

  function alternar() {
    if (activo) {
      setActivo(false);
      try {
        window.localStorage.setItem(MEMORIA, "0");
      } catch {
        /* sin memoria: vale solo para esta visita */
      }
      return;
    }

    // Este clic es el permiso que pide el navegador para poder sonar después
    if (!audio.current) {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return;
      audio.current = new Ctx();
    }
    void audio.current.resume();
    sonar(); // una prueba, para saber a qué volumen quedó

    // Se pide aquí, aprovechando el clic: los navegadores rechazan el permiso
    // si se pide solo, al cargar la página
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission();
    }

    setActivo(true);
    try {
      window.localStorage.setItem(MEMORIA, "1");
    } catch {
      /* sin memoria: vale solo para esta visita */
    }
  }

  useEffect(() => {
    let vivo = true;

    async function mirar() {
      try {
        const res = await fetch("/api/admin/pedidos-nuevos", { cache: "no-store" });
        if (!res.ok || !vivo) return;
        const data = (await res.json()) as { ultimo: Ultimo | null };
        const ultimo = data.ultimo;
        if (!ultimo || !vivo) return;

        // La primera vuelta solo toma nota: al abrir el panel el último pedido
        // ya estaba ahí y no hay nada que anunciar
        if (visto.current === null) {
          visto.current = ultimo.id;
          return;
        }
        if (visto.current === ultimo.id) return;

        visto.current = ultimo.id;
        setAviso(ultimo);
        if (activoRef.current) {
          sonar();
          notificar(ultimo);
        }
        // Que la pantalla abierta muestre el pedido sin tener que recargar
        router.refresh();
      } catch {
        /* sin internet o servidor reiniciando: se reintenta en la siguiente */
      }
    }

    void mirar();
    // No es un setInterval normal: ese se frena con la pestaña de fondo
    const detener = intervaloDeFondo(() => void mirar(), CADA);

    // Al volver a la pestaña se mira de inmediato, sin esperar el turno
    const alVolver = () => {
      if (document.visibilityState === "visible") void mirar();
    };
    document.addEventListener("visibilitychange", alVolver);

    return () => {
      vivo = false;
      detener();
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [router, sonar, notificar]);

  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(null), 12000);
    return () => window.clearTimeout(t);
  }, [aviso]);

  return (
    <>
      <button
        type="button"
        onClick={alternar}
        title={
          activo
            ? "Aviso sonoro encendido. Toca para silenciarlo."
            : "Toca para que suene cuando entre un pedido."
        }
        aria-pressed={activo}
        className={`fixed bottom-6 right-6 z-[190] grid h-12 w-12 place-items-center rounded-full border-2 border-ink shadow-[4px_4px_0_var(--color-ink)] transition hover:-translate-y-0.5 ${
          activo ? "bg-mango text-ink" : "bg-cream/80 text-ink/50"
        }`}
      >
        {activo ? <BellIcon className="h-5 w-5" /> : <BellOffIcon className="h-5 w-5" />}
        <span className="sr-only">
          {activo ? "Silenciar aviso de pedidos" : "Activar aviso de pedidos"}
        </span>
        {activo && pendingCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-ink bg-berry px-1 text-[11px] font-black text-cream">
            {pendingCount}
          </span>
        )}
      </button>

      {aviso && (
        <div
          role="status"
          aria-live="assertive"
          className="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 animate-[pop-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)]"
        >
          <a
            href="/admin/pedidos"
            className="flex items-center gap-3 rounded-full border-2 border-ink bg-mango px-6 py-3.5 text-ink shadow-[5px_5px_0_var(--color-ink)] transition hover:-translate-y-0.5"
          >
            <ReceiptIcon className="h-5 w-5 shrink-0" />
            <span className="text-left leading-tight">
              <span className="block font-display text-lg leading-none">
                ¡Pedido nuevo!
              </span>
              <span className="block text-xs font-bold opacity-70">
                {aviso.nombre} · {aviso.code}
              </span>
            </span>
          </a>
        </div>
      )}
    </>
  );
}
