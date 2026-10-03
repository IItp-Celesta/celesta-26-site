"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthUserContext";

export function useComboOrders() {
  const [comboOrders, setComboOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!authUser?.uid) {
      setComboOrders([]);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "combo_orders"),
          where("uid", "==", authUser.uid)
        );

        const querySnapshot = await getDocs(q);
        
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Sort newest first based on the submittedAt timestamp
        docs.sort((a, b) => {
          const dateA = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(0);
          const dateB = b.submittedAt?.toDate ? b.submittedAt.toDate() : new Date(0);
          return dateB - dateA;
        });

        setComboOrders(docs);
      } catch (error) {
        console.error("Error fetching combo orders:", error);
        setComboOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

  }, [authUser, authLoading]);

  return {
    comboOrders,
    loading,
  };
}