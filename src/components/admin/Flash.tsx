"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/Icons";

/**
 * Aviso de "se guardó" del panel.
 *
 * El mensaje llega en una cookie que dejan las acciones del servidor. Se
 * borra apenas se muestra: si no, al navegar a otra sección dentro de los
 * diez segundos de vida de la cookie, el aviso reaparecería sin que nadie
 * haya guardado nada.
 */
export default function Flash({ mensaje }: { mensaje: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.cookie = "roa_flash=; Max-Age=0; path=/admin";
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 3200);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 animate-[pop-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)]"
    >
      <p className="flex items-center gap-2.5 rounded-full border-2 border-ink bg-mango px-6 py-3.5 font-display text-lg text-ink shadow-[5px_5px_0_var(--color-ink)]">
        <CheckIcon className="h-5 w-5" />
        {mensaje}
      </p>
    </div>
  );
}
