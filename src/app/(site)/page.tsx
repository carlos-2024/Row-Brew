import Hero from "@/components/sections/Hero";
import Propuesta from "@/components/sections/Propuesta";
import Promos from "@/components/sections/Promos";
import Destacados from "@/components/sections/Destacados";
import Experiencia from "@/components/sections/Experiencia";
import Aliados from "@/components/sections/Aliados";
import Contacto from "@/components/sections/Contacto";
import { getSettings } from "@/lib/settings";
import { getExtras, getFeatured, getPromos } from "@/lib/menu";
import { getAlliesSummary } from "@/lib/allies";

// Los datos vienen de la base, así que la home se renderiza en cada visita.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, promos, featured, extras, allies] = await Promise.all([
    getSettings(),
    getPromos(),
    getFeatured(4),
    getExtras(),
    getAlliesSummary(),
  ]);

  return (
    <>
      <Hero settings={settings} />
      <Propuesta settings={settings} />
      {/* Aquí iba "Elige tu familia", oculta por decisión del negocio; ese
          lugar lo ocupan ahora los aliados.
          Para reponerla: importar Familias desde components/sections, volver a
          pedir getMenu() arriba y renderizar
          <Familias categories={...} currency={settings.currency} /> aquí. */}
      <Aliados allies={allies} />
      <Promos promos={promos} currency={settings.currency} />
      <Destacados products={featured} extras={extras} currency={settings.currency} />
      <Experiencia note={settings.eventsNote} />
      <Contacto settings={settings} />
    </>
  );
}
