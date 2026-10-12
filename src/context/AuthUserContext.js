"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import axios from "axios";
import { auth } from "@/lib/firebase";

const AuthUserContext = createContext({
  authUser: null,
  userData: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
});

export function AuthUserProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthUser(null);
        setUserData(null);
        setLoading(false);
        return;
      }

      setAuthUser(user);
      setLoading(true);

      try {
        const token = await user.getIdToken();

        const profileRes = await axios.get("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserData(profileRes.data.success ? profileRes.data.user : null);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  };

  const signOutUser = async () => {
    setUserData(null);
    return await signOut(auth);
  };

  const signUpWithEmail = async (email, password) => {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <AuthUserContext.Provider
      value={{
        authUser,
        userData,
        loading,
        signInWithGoogle,
        signOutUser,
        signInWithEmail,
        signUpWithEmail,
      }}
    >
      {children}
    </AuthUserContext.Provider>
  );
}

export const useAuth = () => useContext(AuthUserContext);
