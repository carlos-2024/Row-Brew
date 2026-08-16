"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/Icons";

export default function WhatsAppFab({
  whatsapp,
  label = "Pide por WhatsApp",
}: {
  whatsapp: string;
  label?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`group fixed bottom-5 left-5 z-30 flex items-center gap-0 overflow-hidden rounded-full border-2 border-ink bg-[#25D366] pl-4 pr-4 text-ink shadow-[5px_5px_0_var(--color-ink)] transition-all duration-400 hover:gap-2 hover:pr-5 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-20 opacity-0"
      }`}
    >
      <span className="py-4"><WhatsAppIcon className="h-7 w-7" /></span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap font-bold transition-[max-width] duration-400 group-hover:max-w-[14rem]">
        {label}
      </span>
    </a>
  );
}
