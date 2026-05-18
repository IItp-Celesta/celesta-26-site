import { AuthUserProvider } from "@/context/AuthUserContext";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";
import Navbar from "@/components/navbar";
import FloatingNav from "@/components/floatnav";
import FloatingCart from "@/components/floatcart";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/footer";
import Cart from "@/components/Cart";
import Head from "next/head"; // ✅ import this
import { Analytics } from "@vercel/analytics/next";

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

      <body>
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
