"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthUserContext = createContext({
  authUser: null,
  loading: true,
  signInWithGoogle: async () => { },
  signOutUser: async () => { },
  signInWithEmail: async () => { },
  signUpWithEmail: async () => { },
});

export function AuthUserProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  };

  const signOutUser = async () => {
    return await signOut(auth);
  };

  const signUpWithEmail = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setAuthUser(userCredential.user);
      return userCredential;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setAuthUser(userCredential.user);
      return userCredential;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <AuthUserContext.Provider value={{ authUser, loading, signInWithGoogle, signOutUser, signInWithEmail, signUpWithEmail }}>
      {children}
    </AuthUserContext.Provider>
  );
}

export const useAuth = () => useContext(AuthUserContext);
