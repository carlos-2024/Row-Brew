import Hero from "@/components/sections/Hero";
import Propuesta from "@/components/sections/Propuesta";
import Familias from "@/components/sections/Familias";
import Promos from "@/components/sections/Promos";
import Destacados from "@/components/sections/Destacados";
import Experiencia from "@/components/sections/Experiencia";
import Cobertura from "@/components/sections/Cobertura";
import Contacto from "@/components/sections/Contacto";
import { getSettings } from "@/lib/settings";
import { getExtras, getFeatured, getMenu, getPromos } from "@/lib/menu";

// Los datos vienen de la base, así que la home se renderiza en cada visita.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, categories, promos, featured, extras] = await Promise.all([
    getSettings(),
    getMenu(),
    getPromos(),
    getFeatured(8),
    getExtras(),
  ]);

  return (
    <>
      <Hero settings={settings} />
      <Propuesta />
      <Familias categories={categories} currency={settings.currency} />
      <Promos promos={promos} currency={settings.currency} />
      <Destacados products={featured} extras={extras} currency={settings.currency} />
      <Experiencia note={settings.eventsNote} />
      <Cobertura settings={settings} />
      <Contacto settings={settings} />
    </>
  );
}
