"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthUserContext";

export function useAccommodationRequests() {
  const [accommodationRequests, setAccommodationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!authUser?.uid) {
      setAccommodationRequests([]);
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        const q = query(
          collection(db, "accommodation_requests"),
          where("uid", "==", authUser.uid),
        );

        const querySnapshot = await getDocs(q);

        const docs = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,

            // Profile display fields
            status: data.status || "PENDING_VERIFICATION",
            totalAmount: data.totalAmount || 0,
            selectedDates: Array.isArray(data.selectedDates)
              ? data.selectedDates
              : [],

            // Transaction ID
            txnId: data.txnId || "",

            // Saved locally for fast sorting
            submittedAt: data.submittedAt || null,

            // Only fetch the member names needed by the profile
            bookedMembers: Array.isArray(data.bookedMembers)
              ? data.bookedMembers.map((member) => ({
                  name: member.name || "Unknown",
                }))
              : [],
          };
        });

        // Newest first
        docs.sort((a, b) => {
          const dateA = a.submittedAt?.toDate?.() || new Date(0);

          const dateB = b.submittedAt?.toDate?.() || new Date(0);

          return dateB - dateA;
        });

        setAccommodationRequests(docs);
      } catch (error) {
        console.error("Error fetching accommodation requests:", error);
        setAccommodationRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [authUser, authLoading]);

  return {
    accommodationRequests,
    loading,
  };
}
