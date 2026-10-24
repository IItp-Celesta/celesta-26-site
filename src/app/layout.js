import { AuthUserProvider } from "@/context/AuthUserContext";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";
import Navbar from "@/components/navbar";
import FloatingNav from "@/components/floatnav";
import FloatingCart from "@/components/floatcart";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/footer";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/next";
import { Anton, Cinzel, Space_Mono } from "next/font/google";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-anton",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        {/* ✅ Font Awesome for LinkedIn + Twitter(X) icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          integrity="sha512-bxKjXx8ZGRo5nF2VhA3YyZsCeVQWkZk/UPJ1Gx3Q03YQmMx1jZqH5ZCsyuXr7p0v9zZIoN5Ue7Onx9V4Y41Iiw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>

      <body
        className={`${anton.variable} ${cinzel.variable} ${spaceMono.variable}`}
      >
        <AuthUserProvider>
          <CartProvider>
            <Navbar/>
            <FloatingNav />
            <FloatingCart />
            {children}
            <Toaster position="top-right" reverseOrder={false} />
            <Footer />
          </CartProvider>
        </AuthUserProvider>
        <Analytics />
      </body>
    </html>
  );
}
