"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { flagshipTeamSchema } from "@/lib/schemas"; // Import the new schema
import { useCart } from "@/context/CartContext";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import FlagshipRegistrationForm from "../../../../components/events/FlagshipRegistrationForm";
import toast from "react-hot-toast";
import data from "../../events.json";
import imageCompression from "browser-image-compression";

export default function FlagshipRegistrationPage({ params }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Try to find the event name based on the slug
  const eventId = params.eventId;
  const event = data.events.find(
    (e) => e.name.toLowerCase().replace(/\s+/g, "-") === eventId,
  );

  const eventName = event ? event.name : "Flagship Event";
  const eventFee = event?.fee;
  const minTeamSize = event?.min || 1;
  const maxTeamSize= event?.max || 5
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(flagshipTeamSchema),
    mode: "onChange",
    defaultValues: {
      numMembers: String(minTeamSize),
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        toast.error("Please login first to register for events!");
        router.push(`/login?redirect=/events/${eventId}/register`);
      } else {
        setCurrentUser(user);
        setIsCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router, eventId]);

  const uploadSecureID = async (file) => {
    let fileToUpload = file;

    if (file.type.startsWith("image/")) {
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      try {
        fileToUpload = await imageCompression(file, options);
      } catch {
        fileToUpload = file;
      }
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      const token = await currentUser.getIdToken();

      const res = await fetch("/api/upload-id", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadedData = await res.json();

      if (!res.ok || !uploadedData.success) {
        throw new Error("ID upload failed. Please try again.");
      }

      return uploadedData.secure_url;
    } catch (error) {
      console.error(error);
      throw new Error("ID upload failed. Please try again.");
    }
  };

  const onSubmit = async (formDataObj) => {
    if (!currentUser) return;

    if (typeof eventFee === "undefined") {
      toast.error("Critical Error: Event price is missing. Contact support.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Adding to Cart...");

    try {
      const totalAmount = parseInt(formDataObj.numMembers || "1") * eventFee;
      const processedMembers = await Promise.all(
        formDataObj.members.map(async (member) => {
          let secureFileId = "";

          if (member.aadhaar && member.aadhaar.length > 0) {
            secureFileId = await uploadSecureID(member.aadhaar[0]);
          }

          return {
            ...member,
            aadhaar: secureFileId,
          };
        }),
      );

      const safeTeamDetails = {
        ...formDataObj,
        members: processedMembers,
        registeredEmail: currentUser.email,
        registeredUid: currentUser.uid,
        eventName: eventName, // Extracted from your page's data fetch
        registrationTime: new Date().toISOString(),
      };

      addToCart({
        id: `EVENT_${eventId}_${Date.now()}`,
        name: `${eventName} (${formDataObj.teamName})`,
        cost: totalAmount,
        type: "event",
        teamDetails: safeTeamDetails,
      });

      toast.success("Added to Cart successfully!", { id: toastId });
      router.push("/profile"); // Take user to checkout
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Document upload failed. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Logging in...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-28 px-4 pb-16 font-sans text-slate-50 relative z-10 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/auth-backdrop.png')" }}
    >
      <div className="max-w-[850px] mx-auto bg-slate-900/80 backdrop-blur-xl border border-sky-500/20 rounded-3xl p-6 md:p-12 ">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider mb-2 bg-gradient-to-r from-sky-300 to-blue-500 bg-clip-text text-transparent">
            {eventName} Registration
          </h1>
          <p className="text-slate-400 text-lg tracking-wide m-0">
            Celesta 2026 Flagship Events
          </p>
        </header>

        <main className="animate-[fadeIn_0.5s_ease-out]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-10"
          >
            <FlagshipRegistrationForm
              register={register}
              errors={errors}
              watch={watch}
              eventFee={eventFee}
              isUploading={isUploading}
              minTeamSize={minTeamSize}
              maxTeamSize={maxTeamSize}
            />
          </form>
        </main>
      </div>
    </div>
  );
}
