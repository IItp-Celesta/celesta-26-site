"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from "@/context/AuthUserContext";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from 'lucide-react';
import { checkout } from '@/lib/checkout';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { authUser, loading, signOutUser } = useAuth();
    const { cart, emptyCart } = useCart();

    // Calculate total cost
    const getTotal = () => {
        return cart.reduce((acc, item) => acc + item.cost * item.quantity, 0);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (isCartOpen) setIsCartOpen(false);
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
        if (isMenuOpen) setIsMenuOpen(false);
    }

    const closeMenu = () => {
        setIsMenuOpen(false);
        setIsCartOpen(false);
    };

    return (
        <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl">
            <nav className="mx-4 flex items-center justify-between rounded-full bg-black/30 p-3 text-white backdrop-blur-md border border-white/10 shadow-lg transition-all hover:bg-black/40">
                <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
                    <Image
                        src="/images/celesta-icon.svg"
                        alt="Celesta Logo"
                        width={35}
                        height={35}
                    />
                    <Image
                        src="/images/typeface-navbar.png"
                        alt="Celesta"
                        width={110}
                        height={35}
                        className="-translate-y-1"
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-6 state-wide text-xs uppercase text-white">
                    <Link href="/" className="opacity-80 hover:opacity-100 transition">Home</Link>
                    <Link href="/so-far" className="opacity-80 hover:opacity-100 transition">Timeline</Link>
                    <Link href="/events" className="opacity-80 hover:opacity-100 transition">Events</Link>
                    <Link href="/spons" className="opacity-80 hover:opacity-100 transition">Sponsors</Link>
                    <Link href="/workshop-registration" className="opacity-80 hover:opacity-100 transition">Workshops</Link>
                    <Link href="/team" className="opacity-80 hover:opacity-100 transition">Team</Link>
                    <Link href="/gallery" className="opacity-80 hover:opacity-100 transition">Gallery</Link>
                    {
                        authUser ?
                            <>
                                {/* <Link href="/store" className="opacity-80 hover:opacity-100 transition">Store</Link> */}
                                <Link href="/profile" className="rounded-full bg-teal-500 px-5 py-2 text-black hover:bg-teal-400 transition">Profile</Link>
                            </>
                            :
                            <>
                                <Link href="/login" className="rounded-full border-2 border-teal-500 px-5 py-2 opacity-80 hover:opacity-100 hover:bg-teal-500 hover:text-black transition">Login</Link>
                                <Link href="/register" className="rounded-full bg-teal-500 px-5 py-2 text-black hover:bg-teal-400 transition">Register</Link>
                            </>
                    }
                </div>

                {/* Mobile Actions (Cart + Hamburger) */}
                <div className="lg:hidden flex items-center gap-4 relative">
                    {/* Mobile Cart Button */}
                    <button
                        onClick={toggleCart}
                        className="relative p-2 text-white hover:text-teal-400 transition"
                    >
                        <ShoppingCart size={24} />
                        {cart.length > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-teal-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                                {cart.length}
                            </span>
                        )}
                    </button>

                    {/* Mobile Hamburger Menu Button */}
                    <button
                        className="flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </button>

                    {/* Cart Dropdown - Repositioned */}
                    {isCartOpen && (
                        <div className="absolute top-full right-0 mt-4 w-72 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/10 shadow-lg animate-in slide-in-from-top-2 duration-300 text-white p-6 z-50">
                            <h3 className="text-xl font-bold mb-4 uppercase text-center">Store</h3>
                            {cart.length === 0 ? (
                                <p className="text-white/70 text-center text-sm">Your cart is empty.</p>
                            ) : (
                                <div className="space-y-4">
                                    <div className="max-h-[200px] overflow-y-auto space-y-2">
                                        {cart.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center bg-white/5 p-2 rounded">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{item.name}</span>
                                                    <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                                                </div>
                                                <span className="font-bold text-teal-400">Rs.{item.cost * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                                        <span className="font-bold">Total</span>
                                        <span className="font-bold text-xl text-teal-400">Rs. {getTotal()}</span>
                                    </div>
                                    <button
                                        onClick={async () => { setIsCartOpen(false); checkout(cart, authUser).then(() => emptyCart()); }}
                                        className="w-full bg-teal-500 text-black font-bold py-3 rounded-xl hover:bg-teal-400 transition"
                                    >
                                        Checkout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-full left-4 right-4 mt-2 rounded-2xl bg-black/60 backdrop-blur-lg border border-white/10 shadow-lg animate-in slide-in-from-top-2 duration-300 text-white font-bold max-h-[80vh] overflow-y-auto">
                    <div className="p-6 space-y-4 state-wide text-xs uppercase text-center">
                        <Link href="/" className="block py-2 opacity-80 hover:opacity-100 transition" onClick={closeMenu}>Home</Link>
                        <Link href="/so-far" className="block py-2 opacity-80 hover:opacity-100 transition" onClick={closeMenu}>So Far</Link>
                        <Link href="/events" className="block py-2 opacity-80 hover:opacity-100 transition" onClick={closeMenu}>Events</Link>
                        <Link href="/spons" className="block py-2 opacity-80 hover:opacity-100 transition" onClick={closeMenu}>Sponsors</Link>
                        <Link href="/workshop" className="block py-2 opacity-80 hover:opacity-100 transition" onClick={closeMenu}>Workshops</Link>
                        <Link href="/team" className="block py-2 opacity-80 hover:opacity-100 transition" onClick={closeMenu}>Team</Link>
                        <Link href="/gallery" className="block py-2 opacity-80 hover:opacity-100 transition" onClick={closeMenu}>Gallery</Link>
                        <Link href="/contact" className="block py-2 opacity-80 hover:opacity-100 transition" onClick={closeMenu}>Contact Us</Link>
                        {authUser ?
                            <>
                                <Link href="/store" className="block py-2 opacity-80 hover:opacity-100 transition" onClick={closeMenu}>Store</Link>
                                <Link href="/profile" className="block py-2 opacity-80 hover:opacity-100 transition" onClick={closeMenu}>Profile</Link>
                                <button onClick={async () => { closeMenu(); await signOutUser(); }} className="block w-full py-2 text-red-400 opacity-80 hover:opacity-100 transition uppercase">Log Out</button>
                            </>
                            :
                            <div className="pt-4 space-y-3">
                                <Link href="/login" className="block text-center rounded-full border-2 border-teal-500 px-5 py-2 opacity-80 hover:opacity-100 hover:bg-teal-500 hover:text-black transition" onClick={closeMenu}>Login</Link>
                                <Link href="/register" className="block text-center rounded-full bg-teal-500 px-5 py-2 text-black hover:bg-teal-400 transition" onClick={closeMenu}>Register</Link>
                            </div>
                        }
                    </div>
                </div>
            )}


        </header>
    );
}

