"use client";
import ProductCard from './product-card'
import styles from './Store.module.css'
import data from './events.json'
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthUserContext";
import { useEffect, useState } from "react";
import { useProducts } from '@/hooks/useProducts';

export default function Store() {
  const { authUser, loading, signOutUser } = useAuth();
  const router = useRouter();
  useEffect(() => {
    async function check() {
      if (!loading && !authUser) {
        router.replace("/register")
      }
    }
    check()
  }, [authUser, router]);
  const { products } = useProducts();
  return <>
    <div className={`bg-muted flex flex-col min-h-svh gap-8 items-left justify-center p-2 md:p-10 ${styles.background} text-white`}>
      <h1 className="race font-bold text-5xl text-grad mt-[15vh]">Store</h1>

      {/* Offers Banner */}
      {/*<div className="max-w-7xl mx-auto w-full mb-8 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 opacity-50" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px]" />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-8 uppercase tracking-wider flex flex-wrap items-center gap-4 border-b border-white/10 pb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-300 state-wide">Early Bird Offers</span>
            <span className="text-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full ml-auto font-mono tracking-widest">
              ENDS 24TH JAN
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-200">
            
            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 hover:bg-black/60 group/card">
              <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                T-Shirt Bundles
              </h3>
              <ul className="space-y-3 font-mono text-sm">
                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-gray-400">1 T-Shirt</span>
                  <span>
                    <span className="line-through text-gray-600 mr-2 text-xs">₹399</span>
                    <span className="text-white font-bold">₹349</span>
                  </span>
                </li>
                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-gray-400">2 T-Shirts</span>
                  <span className="text-white font-bold">₹698</span>
                </li>
                <li className="flex justify-between items-center bg-cyan-500/10 -mx-2 px-2 py-1 rounded">
                  <span className="text-cyan-300 font-bold">3 T-Shirts</span>
                  <span className="text-cyan-300 font-bold text-lg">₹999</span>
                </li>
              </ul>
            </div>

            
            <div className="bg-gradient-to-b from-purple-900/20 to-black/40 p-1 rounded-2xl relative group/highlight">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl opacity-20 group-hover/highlight:opacity-40 transition-opacity blur-md" />
              <div className="bg-black/80 h-full w-full rounded-xl p-5 relative border border-purple-500/30">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-purple-500/40">
                  Best Value
                </div>

                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 mb-2 mt-2 text-center">
                  Hoodie + T-Shirt
                </h3>

                <div className="flex flex-col h-[calc(100%-3rem)] justify-center items-center py-4">
                  <div className="text-5xl font-bold text-white mb-2 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    ₹999
                  </div>
                  <div className="text-sm text-gray-400 mb-4 text-center">
                    Combo Deal
                  </div>
                  <div className="bg-white/10 text-white/90 text-xs px-3 py-1 rounded-lg border border-white/10">
                    Save ₹99 instantly
                  </div>
                </div>
              </div>
            </div>

            
            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all duration-300 hover:bg-black/60">
              <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                Hoodie Bundles
              </h3>
              <ul className="space-y-3 font-mono text-sm">
                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-gray-400">1 Hoodie</span>
                  <span className="text-white font-bold">₹749</span>
                </li>
                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-gray-400">2 Hoodies</span>
                  <span className="text-white font-bold">₹1459</span>
                </li>
                <li className="flex justify-between items-center bg-purple-500/10 -mx-2 px-2 py-1 rounded">
                  <span className="text-purple-300 font-bold">3 Hoodies</span>
                  <span className="text-purple-300 font-bold text-lg">₹2149</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>*/}
      <div className="flex items-center justify-center flex-wrap gap-2 md:gap-8">
        {products.map((product, idx) => <ProductCard key={idx} name={product.name} cost={product.cost} id={product.id} img_src={product.img_src} />)}
      </div>
    </div>
  </>
}
