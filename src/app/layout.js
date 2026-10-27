import { AuthUserProvider } from "@/context/AuthUserContext";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";
import Navbar from "@/components/navbar";
import FloatingNav from "@/components/floatnav";
import FloatingCart from "@/components/floatcart";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/footer";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  metadataBase: new URL("https://celesta.iitp.ac.in"),
  title: {
    default: "Celesta ",
    template: "%s | Celesta 2026",
  },
  description:
    "Celesta 2026 celebrates the fusion of ideas, technologies, and aesthetics across past, present, and future. Explore events, performers, and the festival theme.",
  keywords: ["Celesta", "Celesta 2026", "college fest", "tech fest", "events"],
  openGraph: {
    title: "Celesta 2026 | Anachronistic Syncretism",
    description:
      "Where science meets creativity and innovation transcends time.",
    siteName: "Celesta",
    images: [{ url: "/images/back.png", width: 1200, height: 630 }],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>

      <body>
        {/* Global responsive background & subtle dark overlay */}
        <div id="global-bg" className="global-bg" aria-hidden="true" />
        <div id="global-overlay" className="global-overlay" aria-hidden="true" />

        <AuthUserProvider>
          <CartProvider>
            <Navbar />
            <FloatingNav />
            <FloatingCart />
            <main id="main-content">{children}</main>
            <Toaster position="top-right" reverseOrder={false} />
            <Footer />
          </CartProvider>
        </AuthUserProvider>
        <Analytics />
      </body>
    </html>
  );
}