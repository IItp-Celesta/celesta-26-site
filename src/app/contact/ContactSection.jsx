"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaInstagram, FaLinkedin, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

const ContactSection = () => {
  return (
    <div className="w-full max-w-lg lg:h-[73vh]  lg:w-[25vw] ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col gap-6 w-full  py-10 px-10 md:px-6 lg:py-18 md:py-10 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20  shadow-lg overflow-hidden"
      >
        {/* Email */}
        <div className="flex items-center gap-4">
          <FaEnvelope className="text-white text-3xl" />
          <p className="text-white text-xl">celesta@iitp.ac.in</p>
        </div>

        {/* Contacts */}
        <div className="flex items-center gap-4">
          <FaPhoneAlt className="text-white text-3xl" />
          <div className="text-white ">
            <p className="text-xl">Bignesh</p>
            <p>+91 79784 52798</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <FaPhoneAlt className="text-white text-3xl" />
          <div className="text-white ">
            <p className="text-xl">Yogyansh Khambra</p>
            <p>+91 95885 36927</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-4">
          <FaMapMarkerAlt className="text-white text-3xl" />
          <div className="text-white ">
            <p className="text-xl">Celesta Office, IIT Patna</p>
            <p>Bihta, Patna</p>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-6">
          <h3 className="text-2xl font-medium text-white mb-4">Follow Us on Social Media</h3>
          <div className="flex gap-6 text-3xl">
            <a
              href="https://www.instagram.com/celestaiitp_official/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-pink-400 transition-colors"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.linkedin.com/company/celesta-iit-patna/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              <FaLinkedin />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactSection;
