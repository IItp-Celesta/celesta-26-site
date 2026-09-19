"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./EventModal.module.css";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

export default function EventModal({ event, onClose }) {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const sameDate = event.start_date === event.end_date;
  // const hasExternalRegister = event.register_link && event.register_link !== "#";
  const hasExternalRegister = false; // Force using the internal flagship registration template
  const hasRulebook = event.rulebook_link && event.rulebook_link !== "#";

  // Lock background scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center ">
      <div className="relative w-full max-w-4xl  bg-zinc-950/95 text-white rounded-2xl border border-white/10 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Close */}
        <button
          onClick={onClose}
          className="hidden md:block absolute top-4 right-4 text-xl text-white/70 hover:text-red-400 transition"
        >
          ✕
        </button>

        {!showForm ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex gap-6 items-start md:flex-row flex-col">
              <div className="relative flex-shrink-0 w-full md:w-[320px] h-[400px]  rounded-xl overflow-hidden bg-white">
                {/* IMAGE */}
                <img
                  src={event.img_src}
                  alt={event.name}
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-contain object-center pointer-events-none select-none"
                />

                {/* DARK OVERLAY */}
                <div className="absolute inset-0 bg-black/40" />
                <button
                  onClick={onClose}
                  className="md:hidden absolute top-4 right-4 text-xl text-white hover:text-red-400 transition"
                >
                  ✕
                </button>

                {/* BUTTONS OVER IMAGE */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3 z-10">
                  {hasRulebook && (
                    <a
                      href={event.rulebook_link}
                      target="_blank"
                      className="w-full text-center px-4 py-2 border border-white/30 rounded-xl  transition-colors   text-white hover:bg-white/10 "
                    >
                      Rulebook
                    </a>
                  )}

                  {event.arena_model_link && event.arena_model_link !== "-" && (
                    <a
                      href={event.arena_model_link}
                      target="_blank"
                      className="w-full text-center px-4 py-2 border border-cyan-400/30 rounded-xl transition-colors text-cyan-400 hover:bg-cyan-400/10 font-semibold"
                    >
                      Arena Model 3D
                    </a>
                  )}

                  {hasExternalRegister ? (
                    <a
                      href={event.register_link}
                      target="_blank"
                      className={`w-full text-center px-4 py-2 rounded-xl ${styles.btn} font-semibold hover:opacity-90 transition`}
                    >
                      Register
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        const slug = event.name
                          .toLowerCase()
                          .replace(/\s+/g, "-");
                        router.push(`/events/${slug}/register`);
                      }}
                      className={`w-full px-4 py-2 rounded-xl ${styles.btn} font-semibold hover:opacity-90 transition`}
                    >
                      Register
                    </button>
                  )}
                </div>
              </div>

              {/* RIGHT CONTENT */}
              <div className="flex-1 min-w-0 p-6">
                <h2 className="text-3xl font-bold mb-2">{event.name}</h2>

                <div className="flex flex-wrap gap-4 text-sm font-semibold text-white/80 mb-4">
                  <span className="text-white/80">
                    🏆{" "}
                    {event.prize_pool !== "#"
                      ?
                        `Prize: ${event.prize_pool}`
                          .split("|")
                          .join(
                            "\u00A0\u00A0\|\u00A0\u00A0",
                          )
                      : "Prize TBA"}
                  </span>
                  {event.mode && (
                    <span className="text-white/90 border border-white/20 px-2 rounded-md">
                      📍 {event.mode}
                    </span>
                  )}
                  {event.fee && (
                    <span className="text-white/90 border border-white/20 px-2 rounded-md">
                      💰 Fee: ₹{event.fee}
                    </span>
                  )}
                </div>

                <p className="text-white/80 leading-relaxed mb-4">
                  {event.description || "Details will be announced soon."}
                </p>

                {event.club && (
                  <div className="mb-2">
                    <span className="text-sm bg-white/5 text-white/90 border border-white/20 px-3 py-1 rounded-full">
                      {event.club}
                    </span>
                  </div>
                )}

                {event.poc?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">Point of Contact</h4>
                    <ul className="list-disc pl-5 text-sm text-white/70 space-y-1">
                      {event.poc.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {event.whatsapp_link && (
                  <div className="mt-4">
                    <a
                      href={event.whatsapp_link}
                      target="_blank"
                      className="flex items-center justify-center gap-2 w-full bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/50 py-2 rounded-xl transition-all"
                    >
                      <span className="text-lg">📱</span> Join WhatsApp Group
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <RegisterForm event={event} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function RegisterForm({ event, onClose }) {
  const [college, setCollege] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [teamName, setTeamName] = useState("");
  const { cart, addToCart, removeFromCart } = useCart();
  const handleKeyDown = (e) => {
    if (e.key === "Enter") e.preventDefault();
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!(college && aadhar && teamName)) {
      toast.error("Please fill required fields");
      return;
    }
    addToCart({
      name: event.name,
      cost: event.fee > 0 ? event.fee : 400,
      img_src: event.img_src,
      id: event.name.toLocaleLowerCase(),
      college: college,
      collegeId: collegeId,
      aadhar: aadhar,
      teamName: teamName,
      quantity: 1,
      type: "event",
    });
    toast.success("Event added to cart");
    onClose();
  };
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Register for {event.name}</h2>

      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="flex flex-col gap-4"
      >
        {/*<input placeholder="Name" className="p-3 rounded-lg bg-white/5 border border-white/10 focus:border-teal-400 outline-none text-white placeholder-white/40 transition-colors" />*/}
        <input
          placeholder="College / Organisation"
          className="p-3 rounded-lg bg-white/5 border border-white/10 focus:border-teal-400 outline-none text-white placeholder-white/40 transition-colors"
          value={college}
          onChange={(e) => setCollege(e.target.value)}
        />
        <input
          placeholder="College ID (if any)"
          className="p-3 rounded-lg bg-white/5 border border-white/10 focus:border-teal-400 outline-none text-white placeholder-white/40 transition-colors"
          value={collegeId}
          onChange={(e) => setCollegeId(e.target.value)}
        />
        <input
          placeholder="Aadhar Card Number"
          className="p-3 rounded-lg bg-white/5 border border-white/10 focus:border-teal-400 outline-none text-white placeholder-white/40 transition-colors"
          value={aadhar}
          onChange={(e) => setAadhar(e.target.value)}
        />
        <input
          placeholder="Team Name"
          className="p-3 rounded-lg bg-white/5 border border-white/10 focus:border-teal-400 outline-none text-white placeholder-white/40 transition-colors"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />

        <button type="submit" className={`${styles.btn} mt-4`}>
          Submit
        </button>
      </form>
    </>
  );
}
