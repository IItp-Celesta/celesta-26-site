"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import { isPassItem, isEventItem } from "@/lib/pricing_algo";

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
    if (!currentUser) return false;
    const updatedCart = [...cart];

    const itemIsPass = isPassItem(item);
    if (itemIsPass && updatedCart.some((i) => isPassItem(i))) {
      toast.error("You can only purchase 1 ticket/pass per account.");
      return false;
    }
    if (itemIsPass && updatedCart.some((i) => isEventItem(i))) {
      toast.error(
        "Passes and event registrations can't be bought together. Please checkout your events first.",
      );
      return false;
    }
    if (isEventItem(item) && updatedCart.some((i) => isPassItem(i))) {
      toast.error(
        "Event registrations and passes can't be bought together. Please checkout or remove your pass first.",
      );
      return false;
    }

    if (updatedCart.some((i) => i.id === item.id)) {
      toast.error("This item is already in your cart.");
      return false;
    }
    updatedCart.push({
      ...item,
      quantity: 1,
    });
    setCart(updatedCart);
    saveCartLocally(updatedCart, currentUser.uid);
    return true;
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