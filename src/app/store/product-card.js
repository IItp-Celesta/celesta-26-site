"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthUserContext";
import { useRouter } from "next/navigation";

export default function ProductCard({ name, cost, img_src, id, type }) {
  const { cart, addToCart, removeFromCart } = useCart();
  const { authUser } = useAuth();
  const router = useRouter();

  const isInCart = cart.some((item) => item.id === id);

  const handleAddToCart = () => {
    if (!authUser) {
      toast.error("Please login first to purchase pass");
      return;
    }
    addToCart({ name, cost, img_src, id, type });
    toast.success("Added to cart");
  };

  const handleRemoveFromCart = () => {
    removeFromCart(id);
    toast.success("Removed from cart");
  };

  return (
    <div className="group relative p-4 rounded-3xl w-full md:w-[22rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(56,189,248,0.3)] flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 hover:border-cyan-400/50 overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Early Bird Badge */}
      {!name.toLowerCase().includes("ticket") &&
        !name.toLowerCase().includes("pass") && (
          <div className="absolute top-0 left-0 z-20 bg-gradient-to-r from-yellow-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-br-xl shadow-lg shadow-yellow-500/20">
            Early Bird Offer
          </div>
        )}

      {/* Image Container */}
      <div className="relative w-full h-[20rem] overflow-hidden rounded-2xl bg-black/20 mb-4 group-hover:scale-[1.02] transition-transform duration-500">
        <Image
          src={img_src}
          alt={name}
          fill
          className="object-contain p-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-500 group-hover:drop-shadow-[0_0_25px_rgba(56,189,248,0.4)]"
        />
        {/* Price Tag (Floating) */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex gap-2 items-center">
          {cost === 349 && (
            <span className="text-gray-400 text-sm line-through">₹399</span>
          )}
          <span className="text-cyan-300 font-mono font-bold tracking-wider">
            ₹{cost}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 z-10">
        <h1 className="text-white text-xl font-bold leading-tight min-h-[3.5rem] line-clamp-2">
          {name}
        </h1>
        <div className="mt-auto">
          {isInCart ? (
            <button
              onClick={handleRemoveFromCart}
              className="w-full py-3 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 hover:border-red-600 font-bold uppercase tracking-wider text-sm transition-all duration-300 active:scale-95"
            >
              Remove from Cart
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold uppercase tracking-wider text-sm shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/40 transition-all duration-300 active:scale-95"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
