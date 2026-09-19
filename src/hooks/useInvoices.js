"use client";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    // Query tickets where uid == user.uid AND status == 'PAID'
    const q = query(
      collection(db, "invoices"),
      where('uid', '==', user.uid),
      where('status', '==', 'PAID')
    );

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoices(docs);
      setLoading(false);
    });

    // Cleanup listener on unmount or when user changes
    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  return { invoices, loading };
}

