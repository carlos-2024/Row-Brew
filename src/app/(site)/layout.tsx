import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import HalloweenDecor from "@/components/HalloweenDecor";
import { esHalloween, getSettings } from "@/lib/settings";
import { getAutoPromos } from "@/lib/menu";
import { parseEventTypes } from "@/lib/events";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, promos] = await Promise.all([getSettings(), getAutoPromos()]);
  const halloween = esHalloween(settings);

  return (
    <CartProvider promos={promos}>
      {/* data-tema cambia los acentos de toda la página desde globals.css.
          Va aquí y no en <html> para que el panel no se disfrace también. */}
      <div data-tema={halloween ? "halloween" : undefined} className="relative">
        {halloween && <HalloweenDecor />}
        <Header whatsapp={settings.whatsapp} />
        <main className="min-h-dvh">{children}</main>
        <Footer settings={settings} />
        <WhatsAppFab whatsapp={settings.whatsapp} />
        <CartDrawer
          whatsapp={settings.whatsapp}
          currency={settings.currency}
          deliveryNote={settings.deliveryNote}
          eventTypes={parseEventTypes(settings.eventTypes)}
        />
      </div>
    </CartProvider>
  );
}
