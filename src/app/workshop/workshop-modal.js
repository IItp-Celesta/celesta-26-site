import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import styles from "../events/EventModal.module.css";

export default function WorkshopModal({ workshop, onClose }) {
    if (!workshop) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Darker backdrop tinted with a slight night-purple hue */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                /* Embedded styling overrides to apply dark purple shadow glows and obsidian glass fill */
                className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto ${styles.glassCard} bg-[#0b0617]/90 border border-purple-500/20 shadow-[0_0_40px_rgba(124,58,237,0.15)] p-6 md:p-8 flex flex-col gap-6`}
            >
                {/* Close Button with purple hover transitions */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-500/40 transition-all z-10"
                >
                    <X className="w-6 h-6 text-white" />
                </button>

                {/* Content Container */}
                <div className="flex flex-col gap-6">
                    {/* Banner Image wrapper with subtle purple tinting in borders */}
                    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-2xl border border-purple-500/20">
                        <Image
                            src={workshop.banner_src}
                            alt={workshop.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                        {/* Title - Smooth white-to-purple-gray layout */}
                        <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">
                            {workshop.name}
                        </h2>

                        {/* Register Button with matching design overrides */}
                        <Link
                            href={workshop.register_link}
                            target="_blank"
                            className={`${styles.btn} min-w-[140px] text-center bg-purple-600 hover:bg-purple-500 text-white font-bold tracking-wide rounded-md p-2 shadow-lg shadow-purple-900/50 transition-all`}
                            style={{ textDecoration: 'none' }}
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}