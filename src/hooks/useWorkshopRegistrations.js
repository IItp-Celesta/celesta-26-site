"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthUserContext";

export function useWorkshopRegistrations() {
  const [workshopRegistrations, setWorkshopRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!authUser?.uid) {
      setWorkshopRegistrations([]);
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        const q = query(
          collection(db, "workshop_registrations"),
          where("uid", "==", authUser.uid)
        );
        const querySnapshot = await getDocs(q);
        
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        docs.sort((a, b) => {
          const dateA = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(0);
          const dateB = b.submittedAt?.toDate ? b.submittedAt.toDate() : new Date(0);
          return dateB - dateA;
        });
        setWorkshopRegistrations(docs);
      } catch (error) {
        console.error("Error fetching workshop registrations:", error);
        setWorkshopRegistrations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [authUser, authLoading]);

  return { workshopRegistrations, loading };
}