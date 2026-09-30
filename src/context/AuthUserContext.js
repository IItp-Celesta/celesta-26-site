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
      setAuthUser(user);

      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();

        const profileRes = await axios.get("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (profileRes.data.success) {
          setUserData(profileRes.data.user);
        } else {
          setUserData(null);
        }
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      setAuthUser(userCredential.user);

      return userCredential;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      setAuthUser(userCredential.user);

      return userCredential;
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
