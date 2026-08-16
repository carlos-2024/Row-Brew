import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <CartProvider>
      <Header whatsapp={settings.whatsapp} />
      <main className="min-h-dvh">{children}</main>
      <Footer settings={settings} />
      <WhatsAppFab whatsapp={settings.whatsapp} />
      <CartDrawer
        whatsapp={settings.whatsapp}
        currency={settings.currency}
        deliveryNote={settings.deliveryNote}
      />
    </CartProvider>
  );
}
