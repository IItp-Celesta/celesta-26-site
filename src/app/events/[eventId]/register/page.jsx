"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { flagshipTeamSchema } from "@/lib/schemas";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthUserContext";
import FlagshipRegistrationForm from "@/components/events/FlagshipRegistrationForm";
import toast from "react-hot-toast";
import data from "@/app/events/events.json";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";
import { isPassItem } from "@/lib/pricing_algo";

export default function FlagshipRegistrationPage({ params }) {
  const router = useRouter();
  const { addToCart, cart } = useCart();
  const { authUser, loading } = useAuth();

  const [isUploading, setIsUploading] = useState(false);

  const eventId = params.eventId;
  const event = data.events.find(
    (e) => e.name.toLowerCase().replace(/\s+/g, "-") === eventId,
  );

  const eventName = event ? event.name : "Flagship Event";
  const eventFee = event?.fee;
  const minTeamSize = event?.min || 1;
  const maxTeamSize = event?.max || 5;
  const fee1 = event?.fee1;

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
    if (!loading && !authUser) {
      toast.error("Please login first to register for events!");
      router.push(`/login?redirect=/events/${eventId}/register`);
    }
  }, [authUser, loading, router, eventId]);

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
      const token = await authUser.getIdToken();

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
    if (!authUser) return;

    if (typeof eventFee === "undefined") {
      toast.error("Critical Error: Event price is missing. Contact support.");
      return;
    }
    if (cart.some(isPassItem)) {
      toast.error(
        "Event registrations and passes can't be bought together. Please checkout or remove your pass first.",
      );
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Adding to Cart...");

    try {
      const numBots = parseInt(formDataObj.numBots || "1", 10);
      const totalAmount = eventFee * numBots;
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
        registeredEmail: authUser.email,
        registeredUid: authUser.uid,
        eventName: eventName,
        registrationTime: new Date().toISOString(),
      };

      const added = await addToCart({
        id: `EVENT_${eventId}_${Date.now()}`,
        name: `${eventName} (${formDataObj.teamName})`,
        cost: totalAmount,
        type: "event",
        teamDetails: safeTeamDetails,
      });

      if (!added) {
        toast.dismiss(toastId);
        return;
      }

      toast.success("Added to Cart successfully!", { id: toastId });
      router.push("/cart");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Document upload failed. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading || !authUser) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-slate-900 text-white`}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="px-4 pt-28 pb-16 md:px-10 md:pt-32 md:pb-20 bg-[url('/images/backdrop.png')] bg-cover bg-center bg-no-repeat text-white min-h-svh flex flex-col items-center justify-start overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, x: -140 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mb-8 text-center md:text-left"
      >
        <h1 className="font-bold text-3xl sm:text-4xl md:text-6xl text-grad race py-2 uppercase tracking-wide">
          {eventName} Registration
        </h1>
        <p className="text-white/70 text-sm sm:text-base md:text-lg px-2 tracking-wide mt-1">
          Celesta 2026 Flagship Events
        </p>
      </motion.div>

      <motion.main
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mb-12 flex flex-col gap-8"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-8 w-full"
        >
          <FlagshipRegistrationForm
            register={register}
            errors={errors}
            watch={watch}
            fee1={fee1}
            eventFee={eventFee}
            isUploading={isUploading}
            minTeamSize={minTeamSize}
            maxTeamSize={maxTeamSize}
          />
        </form>
      </motion.main>
    </div>
  );
}