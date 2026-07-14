"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import styles from "./Contact.module.css";

const ContactSection = () => {
  const [data, setData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send data to your own Next.js API route instead of Web3Forms
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("Thank you! Your message has been sent.");
        setData({ name: "", email: "", message: "" }); // Clear form
      } else {
        toast.error(result.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg lg:h-[73vh]  lg:w-[25vw]">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-6 w-full  p-6 md:p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20  shadow-lg overflow-hidden    "
      >
       

        <div className="flex flex-col gap-2">
          <label className="text-white font-medium">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-teal-500 focus:outline-none placeholder-white/70"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-white font-medium">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            className="p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-teal-500 focus:outline-none placeholder-white/70"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-white font-medium">Message</label>
          <textarea
            rows="5"
            name="message"
            placeholder="Enter your message"
            value={data.message}
            onChange={(e) => setData({ ...data, message: e.target.value })}
            className="p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-teal-500 focus:outline-none placeholder-white/70 resize-none"
            required
          />
        </div>
        <div className="flex justify-center items-center mt-4">
  <button
    type="submit"
    disabled={isSubmitting}
    className={`px-6 py-3 ${styles["btn"]}  hover:opacity-90 ${
      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
    }`}
  >
    {isSubmitting ? "Submitting..." : "Submit"}
  </button>
</div>

      </motion.form>
    </div>
  );
};

export default ContactSection;
