"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCartLoading, setIsCartLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        const localCart = localStorage.getItem(`celesta_cart_${user.uid}`);
        if (localCart) {
          try {
            setCart(JSON.parse(localCart));
          } catch (e) {
            console.error("Failed to parse local cart", e);
            setCart([]);
          }
        } else {
          setCart([]);
        }
      } else {
        setCart([]);
      }
      setIsCartLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const saveCartLocally = (newCart, uid) => {
    if (!uid) return;
    localStorage.setItem(`celesta_cart_${uid}`, JSON.stringify(newCart));
  };

  const addToCart = async (item) => {
    if (!currentUser) return;

    let updatedCart = [...cart];
    const existingItemIndex = updatedCart.findIndex((i) => i.id === item.id);

    if (existingItemIndex >= 0) {
      const isEvent = item.type === "event" || String(item.id).startsWith("EVENT_");
      
      if (isEvent) {
        updatedCart[existingItemIndex] = { ...item, quantity: 1 };
      } else {
        updatedCart[existingItemIndex].quantity =
          (updatedCart[existingItemIndex].quantity || 1) + 1;
      }
    } else {
      updatedCart.push({ ...item, quantity: 1 });
    }

    setCart(updatedCart);
    saveCartLocally(updatedCart, currentUser.uid);
  };

  const removeFromCart = async (itemId) => {
    if (!currentUser) return;

    const updatedCart = cart.filter((i) => i.id !== itemId);
    setCart(updatedCart);
    saveCartLocally(updatedCart, currentUser.uid);
  };

  const emptyCart = async () => {
    if (!currentUser) return;

    setCart([]);
    localStorage.removeItem(`celesta_cart_${currentUser.uid}`);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, emptyCart, isCartLoading }}
    >
      {children}
    </CartContext.Provider>
  );
};