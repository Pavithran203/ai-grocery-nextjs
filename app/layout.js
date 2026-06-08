import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import I18nProvider from "@/components/I18nProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { StoreProvider } from "@/context/StoreContext";
import { AddressProvider } from "@/context/AddressContext";
import { LocationProvider } from "@/context/LocationContext";
import Navbar from "@/components/Navbar";
import ChatFAB from "@/components/ChatFAB";
import LoginModal from "@/components/LoginModal";
import CartDrawer from "@/components/CartDrawer";
import LocationModal from "@/components/LocationModal";
import CartToast from "@/components/CartToast";

import { PreferencesProvider } from "@/context/PreferencesContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { LoyaltyProvider } from "@/context/LoyaltyContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { FavoriteProvider } from "@/context/FavoriteContext";
import { TrackingProvider } from "@/context/TrackingContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Near Mart - AI Grocery Delivery",
  description: "Fast, fresh, smart grocery delivery with AI-powered recommendations. UPI, Card & COD payments.",
};

export default function RootLayout({ children, modal }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <I18nProvider>
          <LanguageProvider>
            <AuthProvider>
              <PreferencesProvider>
                <AddressProvider>
                  <LocationProvider>
                    <StoreProvider>
                      <OrdersProvider>
                        <LoyaltyProvider>
                          <CartProvider>
                            <WishlistProvider>
                              <FavoriteProvider>
                                <TrackingProvider>
                                  <div className="min-h-screen flex flex-col">
                                  <Navbar />
                                  <main className="flex-grow">
                                    {children}
                                  </main>
                                  {modal}
                                  <CartToast />
                                  <ChatFAB />
                                  <LoginModal />
                                  <CartDrawer />
                                  <LocationModal />
                                  </div>
                                </TrackingProvider>
                              </FavoriteProvider>
                            </WishlistProvider>
                          </CartProvider>
                        </LoyaltyProvider>
                      </OrdersProvider>
                    </StoreProvider>
                  </LocationProvider>
                </AddressProvider>
              </PreferencesProvider>
            </AuthProvider>
          </LanguageProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
