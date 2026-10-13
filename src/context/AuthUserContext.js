"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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
  fetchUserProfile: async () => null,
  setUserData: () => {},
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
});

export function AuthUserProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userToFetch = null) => {
    const targetUser = userToFetch || auth.currentUser;
    if (!targetUser) {
      setUserData(null);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      const token = await targetUser.getIdToken(true);

      const profileRes = await axios.get("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profile = profileRes.data.success ? profileRes.data.user : null;
      setUserData(profile);
      return profile;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setUserData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      await fetchUserProfile(user);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

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
        fetchUserProfile,
        setUserData,
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
