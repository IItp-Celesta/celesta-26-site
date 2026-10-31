"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const sponsorData = [
    { logo: "1amalfi.jpg", url: "https://amalfiindia.com/" },
    { logo: "2beardo.png", url: "https://www.beardo.in/" },
    { logo: "3bihartourism.png", url: "https://tourism.bihar.gov.in/" },
    { logo: "4bingo.png", url: "https://www.itcportal.com/brands-microsite/bingo.aspx" },
    { logo: "5brpnnl.png", url: "https://bihar.nic.in/" },
    { logo: "6bsacs.png", url: "https://x.com/bsacsofficial?lang=en" },
    { logo: "7coding ninjas.png", url: "https://www.codingninjas.com/" },
    { logo: "8coke.png", url: "https://www.coca-cola.com/in/en" },
    { logo: "9communityevents.png", url: "https://crowdsource.google.com/" },
    { logo: "10dubeat.png", url: "https://dubeat.com/" },
    { logo: "11eduquis.png", url: "https://eduquis.in/" },
    { logo: "12engconvo.png", url: "https://engconvo.com/" },
    { logo: "13eventom.png", url: "https://www.eventom.co.in/" },
    { logo: "14grabon.png", url: "https://www.grabon.in/" },
    { logo: "15hackerearth.png", url: "https://www.hackerearth.com/" },
    { logo: "16hero.png", url: "https://www.heromotocorp.com/" },
    { logo: "17himalayan yeti.png", url: "https://www.thehimalayanyeti.co.in/" },
    { logo: "18hp.png", url: "https://www.hindustanpetroleum.com/" },
    { logo: "19icetl.png", url: "#" },
    { logo: "20jetbrains.png", url: "https://www.jetbrains.com/" },
    { logo: "21jktyre.png", url: "https://www.jktyre.com/" },
    { logo: "22knowafest.png", url: "https://www.knowafest.com/" },
    { logo: "23lic.png", url: "https://licindia.in/" },
    { logo: "24lsmaster.jpg", url: "https://in.linkedin.com/parvagarwal" },
    { logo: "25nhai.jpg", url: "https://nhai.gov.in/" },
    { logo: "26ntpc.png", url: "https://www.ntpc.co.in/" },
    { logo: "27nvidia.png", url: "https://www.nvidia.com/" },
    { logo: "28patnabeats.png", url: "https://in.linkedin.com/company/patnabeats" },
    { logo: "29patriles.png", url: "#" },
    { logo: "30pizahut.png", url: "https://www.pizzahut.co.in/" },
    { logo: "31razorpay.png", url: "https://razorpay.com/" },
    { logo: "32redbull.jpg", url: "https://www.redbull.com/" },
    { logo: "33redfm.png", url: "https://www.redfmindia.in/" },
    { logo: "34sbi.png", url: "https://www.onlinesbi.sbi/" },
    { logo: "35souledstore.png", url: "https://www.thesouledstore.com/" },
    { logo: "36stpi.jpg", url: "https://stpi.in/" },
    { logo: "37strtupbihar.jpg", url: "https://startup.bihar.gov.in/" },
    { logo: "38swiggy.png", url: "https://www.swiggy.com/" },
    { logo: "39sybbline.png", url: "https://sibylline.co.uk/" },
    { logo: "40techbyte.png", url: "https://techbyte.co.in/" },
    { logo: "41techschool.png", url: "https://techprolabz.com/" },
    { logo: "42townscript.png", url: "https://www.townscript.com/" },
    { logo: "43udyogvibhag.jpg", url: "https://udyami.bihar.gov.in/" },
    { logo: "44ultratech.png", url: "https://www.ultratechcement.com/" },
    { logo: "45unstop.jpg", url: "https://unstop.com/" },
    { logo: "46youtuh incorporated.png", url: "https://youthincmag.com/" },
    { logo: "47zebronics.png", url: "https://zebronics.com/" }
];

const logosNeedingWhiteBg = [5, 6, 7, 20, 26, 27, 30, 35];

const currentSponsorData = [
    { name: "Bingo! Mad Angles", logo: "4bingo.png", url: "https://www.bingosnacks.com/" },
    { name: "Avaya", logo: "Avaya_Logo_Hi_Res_JPEG_File_White.jpg", url: "https://www.avaya.com/" },
    { name: "Bihar State Co-operative Bank", logo: "BCBank_Logo.jpg", url: "https://biharscb.bank.in/" },
    { name: "BMSICL", logo: "BMSICL.png", url: "https://www.bmsicl.gov.in/" },
    { name: "BSBCCL", logo: "Copy of LOGO-BSBCCL.jpg", url: "https://bsbccl.bihar.gov.in/" },
    { name: "Department of Information Technology, Bihar", logo: "DIT logo.png", url: "https://state.bihar.gov.in/dit/CitizenHome.html" },
    { name: "Drishti", logo: "drishti.jpeg", url: "https://drishti.org.in/" },
    { name: "EaseMyTrip", logo: "EaseMyTrip Logo.png", url: "https://www.easemytrip.com/" },
    { name: "IndianOil", logo: "IOCL(1).jpg", url: "https://www.iocl.com/" },
    { name: "NIELIT", logo: "logo1.png", url: "https://www.nielit.gov.in/" },
    { name: "Elista", logo: "Elista---Built-For-U---Logo--in-gif (1).gif", url: "https://www.elistahome.com/" },
    { name: "Bihar Excise Department", logo: "excise_logo_logo.png", url: "https://state.bihar.gov.in/excise/" },
    { name: "Innovation Center, IIT Patna", logo: "IC.jpg", url: "https://iciitp.com/" },
    { name: "India Post", logo: "India Post Dak Sewa Jan Sewa New Logo Final.webp", url: "https://www.indiapost.gov.in/" },
    { name: "JioSaavn", logo: "JioSaavn Logo - White.png", url: "https://www.jiosaavn.com/" },
    { name: "Life Insurance Corporation of India", logo: "LIC LOGO-HAR PAL .jpg", url: "https://licindia.in/" },
    { name: "NBCC (India) Limited", logo: "Screenshot 2026-10-29 185503.png", url: "https://www.nbccindia.com/" },
    { name: "Nutridrop", logo: "Nutridrop_Logo.PNG", url: "" },
    { name: "Pepero", logo: "PEPERO Logo.jpeg", url: "https://www.lotteindia.com/" },
    { name: "Pocket FM", logo: "Primary .png", url: "https://www.pocketfm.com/" },
    { name: "Raj Milk & Milk Products", logo: "Rajfresh -full logo.png", url: "https://www.anujdairy.com" },
    { name: "REC Limited", logo: "REC Maharatna logo (1)_page-0001.jpg", url: "https://recindia.nic.in/" },
    { name: "Utho", logo: "Utho White (1).png", url: "https://utho.com/" },
    { name: "Bihar State Mining Corporation", logo: "WhatsApp Image 2026-10-27 at 17.38.01.jpeg", url: "https://bsmcl.bihar.gov.in/" },
    { name: "BMW Motorrad", logo: "WhatsApp Image 2026-10-28 at 10.21.01 (1).jpeg", url: "https://www.bmw-motorrad.in/" },
    { name: "Canara Bank", logo: "WhatsApp Image 2026-10-30 at 3.56.34 PM.jpeg", url: "https://www.canarabank.bank.in/" },
    { name: "vivo", logo: "vivo logo black.png", url: "https://www.vivo.com/in/" },
    { name: "Wild Stone", logo: "wildstone.jpg", url: "https://www.wildstone.in/" },
];

const currentSponsors = currentSponsorData.map((sponsor) => ({
    name: sponsor.name,
    logoUrl: `/spons_logos/current/${encodeURIComponent(sponsor.logo)}`,
    websiteUrl: sponsor.url,
    needsWhiteBg: false,
}));

const previousSponsors = sponsorData.map((sponsor, i) => ({
    name: `Previous Sponsor ${i + 1}`,
    logoUrl: `/spons_logos/${encodeURIComponent(sponsor.logo)}`,
    websiteUrl: sponsor.url,
    needsWhiteBg: logosNeedingWhiteBg.includes(i + 1),
}));

const SponsorCard = ({ sponsor }: { sponsor: { name: string, logoUrl: string, websiteUrl: string, needsWhiteBg: boolean } }) => {
    return (
        <motion.a
            href={sponsor.websiteUrl || undefined}
            target={sponsor.websiteUrl ? "_blank" : undefined}
            rel={sponsor.websiteUrl ? "noopener noreferrer" : undefined}
            aria-label={sponsor.websiteUrl ? `Visit ${sponsor.name} website` : `${sponsor.name} logo`}
            className={`group block relative w-full h-full ${sponsor.websiteUrl ? "" : "cursor-default"}`}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
            <div className="bg-slate-900/30 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 group-hover:border-cyan-500/80 transition-all duration-300 h-full flex items-center justify-center aspect-[16/9] group-hover:shadow-2xl group-hover:shadow-cyan-500/10">
                <div className={cn(
                    "w-full h-full rounded-lg flex items-center justify-center p-0 md:p-2",
                    sponsor.needsWhiteBg && "bg-white"
                )}>
                    <Image
                        src={sponsor.logoUrl}
                        alt={`${sponsor.name} logo`}
                        width={250}
                        height={150}
                        className="max-h-full w-auto object-contain transition-transform duration-300"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://placehold.co/250x150/111827/FFFFFF?text=${sponsor.name.replace(' ', '+')}`;
                        }}
                    />
                </div>
            </div>
        </motion.a>
    );
};

const SponsorMarquee = ({
    sponsors,
    duration = 60,
}: {
    sponsors: typeof currentSponsors;
    duration?: number;
}) => (
    <div className="hide-scrollbar w-full overflow-hidden" aria-label="Sponsor logos">
        <div className="sponsor-marquee-track" style={{ animationDuration: `${duration}s` }}>
            {[0, 1].map((copy) => (
                <div
                    key={copy}
                    className="sponsor-marquee-group flex shrink-0 items-center gap-4 pr-4"
                    aria-hidden={copy === 1}
                >
                    {sponsors.map((sponsor) => (
                        <div key={sponsor.name} className="w-[200px] md:w-[240px] aspect-[16/9] shrink-0">
                            <SponsorCard sponsor={sponsor} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

const CodingBitsCelebration = () => {
    const bits = ['</>', '{}', '=>', '01', '()', '[]', '&&', '||', '!', '++'];
    const particles = Array.from({ length: 100 }).map((_, i) => {
        const bit = bits[Math.floor(Math.random() * bits.length)];
        const x = Math.random() * 100;
        const duration = 2 + Math.random() * 3;
        const delay = Math.random() * 2;
        const scale = 1 + Math.random() * 1.5;
        return (
            <motion.span
                key={i}
                initial={{ y: '-10vh', x: `${x}vw`, opacity: 0, scale: 0 }}
                animate={{ y: '110vh', opacity: 1, scale: scale }}
                transition={{ duration, delay, ease: "linear" }}
                className="absolute text-cyan-400/80 font-mono text-3xl"
            >
                {bit}
            </motion.span>
        );
    });

    return <div className="fixed inset-0 z-50 pointer-events-none">{particles}</div>;
};

export default function SponsorsPage() {
    const [showGame, setShowGame] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [logoTaps, setLogoTaps] = useState(0);

    useEffect(() => {
        if (logoTaps > 0) {
            const timer = setTimeout(() => setLogoTaps(0), 2000);
            return () => clearTimeout(timer);
        }
    }, [logoTaps]);

    const handleLogoClick = () => {
        const newTaps = logoTaps + 1;
        setLogoTaps(newTaps);
        if (newTaps >= 7) {
            setShowCelebration(true);
            setTimeout(() => {
                setShowCelebration(false);
                setShowGame(true);
            }, 3000);
            setLogoTaps(0);
        }
    };

    return (
        <div
            className="min-h-screen text-white relative overflow-hidden font-sans"
        >
            

            <div className="absolute inset-0 z-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,transparent_65%,white_100%)]">
                <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
                    <defs>
                        <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="currentColor" strokeWidth="0.5"></path></pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)"></rect>
                </svg>
            </div>
            <div className="container mx-auto px-4 py-24 relative z-10 flex flex-col items-center pt-32">
                <motion.h1
                    className="text-5xl md:text-7xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 race uppercase"
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                >
                   Our Sponsors
                </motion.h1>
                <motion.p
                    className="text-lg text-center text-gray-400 mb-4 max-w-2xl"
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Fueling innovation and making our events possible.
                </motion.p>
                <section aria-labelledby="current-sponsors-heading" className="w-full max-w-7xl mt-8">
                    <h2 id="current-sponsors-heading" className="sr-only">Our Sponsors</h2>
                    <SponsorMarquee sponsors={currentSponsors} duration={72} />
                </section>

                <section aria-labelledby="previous-sponsors-heading" className="w-full max-w-7xl mt-12">
                    <h2 id="previous-sponsors-heading" className="text-4xl md:text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 race uppercase">
                        Previous Sponsors
                    </h2>
                    <div className="flex flex-col gap-4">
                        <SponsorMarquee sponsors={previousSponsors.slice(0, Math.ceil(previousSponsors.length / 2))} duration={64} />
                        <SponsorMarquee sponsors={previousSponsors.slice(Math.ceil(previousSponsors.length / 2))} duration={58} />
                    </div>
                </section>
                <div className="mt-8 flex justify-center">
                    <button onClick={handleLogoClick} className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping-slow"></div>
                        <Image src="/images/celesta-icon.svg" alt="Celesta Icon" width={40} height={40} className="w-10 h-10" />
                    </button>
                </div>
                <motion.p
                    className="mt-4 text-xs text-gray-500 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                >
                    Hint: Tap the logo seven times.
                </motion.p>
            </div>
            <AnimatePresence>
                {showCelebration && <CodingBitsCelebration />}
                {showGame && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <div className="w-full h-full max-w-4xl max-h-[80vh] bg-slate-900/50 backdrop-blur-lg border border-slate-700 rounded-lg shadow-2xl p-4 flex flex-col">
                            <iframe src="https://dino-chrome.com/" title="Chrome Dino Game" className="w-full h-full border-0 rounded-md" />
                            <button onClick={() => setShowGame(false)} className="mt-4 bg-gray-300 text-black font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                                Close Game
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style jsx global>{`
                .hide-scrollbar {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .sponsor-marquee-track {
                    display: flex;
                    width: max-content;
                    animation: sponsor-marquee linear infinite;
                }
                .sponsor-marquee-track:hover {
                    animation-play-state: paused;
                }
                @keyframes sponsor-marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .sponsor-marquee-track {
                        animation: none;
                    }
                    .sponsor-marquee-group[aria-hidden="true"] {
                        display: none;
                    }
                    .hide-scrollbar:has(.sponsor-marquee-track) {
                        overflow: visible;
                    }
                    .sponsor-marquee-group[aria-hidden="false"] {
                        flex-wrap: wrap;
                    }
                }
                @keyframes ping-slow {
                    0% { transform: scale(1); opacity: 0.75; }
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                .animate-ping-slow {
                    animation: ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
            `}</style>
        </div>
    );
}
