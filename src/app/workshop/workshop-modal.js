import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import styles from "../events/EventModal.module.css"; // Reuse glassmorphism styles

export default function WorkshopModal({ workshop, onClose }) {
    if (!workshop) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto ${styles.glassCard} p-6 md:p-8 flex flex-col gap-6`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                >
                    <X className="w-6 h-6 text-white" />
                </button>

                {/* Content Container */}
                <div className="flex flex-col gap-6">
                    {/* Banner Image */}
                    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                        <Image
                            src={workshop.banner_src}
                            alt={workshop.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                        {/* Title */}
                        <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {workshop.name}
                        </h2>

                        {/* Register Button */}
                        <Link
                            href={workshop.register_link}
                            className={`${styles.btn} min-w-[140px] text-center`}
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}