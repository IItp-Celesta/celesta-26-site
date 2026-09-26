"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthUserContext";

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const { authUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!authUser?.uid) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "invoices"),
      where("uid", "==", authUser.uid),
      where("status", "==", "PAID"),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setInvoices(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching invoices:", error);
        setInvoices([]);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [authUser, authLoading]);

  return {
    invoices,
    loading,
  };
}
