"use client";

import EventCard from "./events/event-card";
import EventModal from "./events/event-modal";

import Image from "next/image";
import styles from "./Home.module.css";
import { ArrowDown, Link } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "./events/events.json";
import SplitText from "@/components/theme/SplitText";
import Reveal from "@/components/theme/Reveal";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const events = data["events"];
  const fadeRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Performers data
  const performers = [
    {
      images: [
        "/images/artists/irfan_1.JPG",
        "/images/artists/irfan_2.JPG",
        "/images/artists/irfan_3.JPG",
      ],
      name: "Mohammed Irfan",
    },
    {
      images: [
        "/images/artists/bassi_1.jpg",
        "/images/artists/bassi_2.webp",
        "/images/artists/bassi_3.webp",
      ],
      name: "Anubhav Singh Bassi",
    },
    {
      images: [
        "/images/artists/kapoor_1.png",
        "/images/artists/kapoor_2.png",
        "/images/artists/kapoor_3.jpg",
      ],
      name: "Gaurav Kapoor",
    },
    {
      images: [
        "/images/artists/aaditya-1.webp",
        "/images/artists/aaditya-2.webp",
        "/images/artists/aaditya-3.webp",
      ],
      name: "Aaditya Kulshreshth",
    },
    {
      images: [
        "/images/artists/ravator_1.jpg",
        "/images/artists/ravator_2.jpg",
        "/images/artists/ravator_3.jpg",
      ],
      name: "Ravator",
    },
    {
      images: [
        "/images/artists/sartek_1.jpeg",
        "/images/artists/sartek_2.webp",
        "/images/artists/sartek_3.jpg",
      ],
      name: "Sartek",
    },
  ];

  // Fade-in sections on scroll
  useEffect(() => {
    gsap.utils.toArray(".reveal-section").forEach((section) => {
      gsap.fromTo(
        section,
        { autoAlpha: 0, y: 100 },
        {
          duration: 1,
          autoAlpha: 1,
          y: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      );
    });
  }, []);

  // Banner animation
  useEffect(() => {
    if (fadeRef.current) {
      gsap.fromTo(
        fadeRef.current,
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1.5, ease: "power2.out" },
      );
    }
  }, []);

  // Image slideshow
  useEffect(() => {
    const intervals = performers.map((performer, idx) => {
      let currentIndex = 0;
      let isAnimating = false;

      return setInterval(() => {
        if (isAnimating) return;

        const currentImg = document.querySelector(
          `#performer-${idx}-img-current`,
        );
        const nextImg = document.querySelector(`#performer-${idx}-img-next`);

        if (currentImg && nextImg) {
          isAnimating = true;
          const nextIndex = (currentIndex + 1) % performer.images.length;
          const direction = idx % 2 === 0 ? "right" : "left";

          // Set next image offscreen
          nextImg.src = performer.images[nextIndex];
          nextImg.style.transition = "none";
          nextImg.style.transform =
            direction === "right" ? "translateX(-100%)" : "translateX(100%)";
          nextImg.style.zIndex = "2";

          // Force reflow
          nextImg.offsetHeight;

          // Animate transition
          requestAnimationFrame(() => {
            currentImg.style.transition = "transform 1s ease-in-out";
            nextImg.style.transition = "transform 1s ease-in-out";

            currentImg.style.transform =
              direction === "right" ? "translateX(100%)" : "translateX(-100%)";
            nextImg.style.transform = "translateX(0)";
            currentImg.style.zIndex = "1";
          });

          setTimeout(() => {
            currentImg.src = performer.images[nextIndex];
            currentImg.style.transition = "none";
            currentImg.style.transform = "translateX(0)";
            currentImg.style.zIndex = "2";
            nextImg.style.zIndex = "1";

            currentIndex = nextIndex;
            isAnimating = false;
          }, 1050);
        }
      }, 3000);
    });

    return () => intervals.forEach((interval) => clearInterval(interval));
  }, [performers]);

  // Animate performer names sliding from left/right
  useEffect(() => {
    performers.forEach((performer, idx) => {
      const el = document.querySelector(`#performer-name-${idx}`);
      if (!el) return;

      const xOffset = idx % 2 === 0 ? -window.innerWidth : window.innerWidth;

      gsap.fromTo(
        el,
        { x: xOffset, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    });
  }, [performers]);

  const THEME_COPY =
    "Celesta 2026 embraces the theme “Anachronistic Syncretism,” a celebration of the seamless fusion of ideas, technologies, and aesthetics from the past, present, and future. It envisions a world where the boundaries of time dissolve, allowing ancient wisdom, forgotten innovations, modern scientific breakthroughs, and futuristic possibilities to converge and create something extraordinary. The theme explores how ideas from different eras can coexist, interact, and evolve, challenging conventional perceptions of time and progress. Through three acts- The Zenith, symbolising the pursuit of ultimate knowledge; The Cascade, representing the flow and transformation of ideas across eras; and The Convergence, where seemingly disconnected timelines and innovations unite to shape a new reality- Anachronistic Syncretism celebrates the limitless potential of human imagination. At its core, the theme reflects the spirit of Celesta: a space where science meets creativity, disciplines intersect, and innovation transcends the boundaries of time to shape the future.";

  const THEME_ACTS = [
    {
      id: 1,
      num: "01",
      title: "The Zenith",
      desc: "The pursuit of ultimate knowledge.",
    },
    {
      id: 2,
      num: "02",
      title: "The Cascade",
      desc: "The flow and transformation of ideas across eras.",
    },
    {
      id: 3,
      num: "03",
      title: "The Convergence",
      desc:
        "Disconnected timelines and innovations unite to shape a new reality.",
    },
  ];

  return (
    <div className="overflow-x-hidden w-full">
      {/* Banner Section */}
      <div
        className={`flex flex-col justify-center items-center ${styles.background}`}
      >
        <section className="flex h-[90vh] justify-center items-center w-full">
          <Image
            className="w-[min(72vw,560px)] h-auto mx-auto"
            src="/images/typeface-navbar.svg"
            alt="Celesta"
            width={517}
            height={131}
          />
          <p className="mt-4 text-[#ebebeb]/90 tracking-[0.2em] text-sm md:text-base">
            Celesta 2026
          </p>
        </section>
        <ArrowDown className="text-[#5bcdbb] mb-8" />
      </div>

      {/* Theme Section */}
      <section className={styles.themeSection}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <p className="text-[#5bcdbb] uppercase tracking-[0.3em] text-xs md:text-sm mb-6">
            The Theme
          </p>
          <h1 className="race text-4xl sm:text-5xl md:text-6xl font-bold uppercase mb-10 text-[#ebebeb]">
            Anachronistic Syncretism
          </h1>
          <p className="text-[#ebebeb]/90 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-14">
            {THEME_COPY}
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {THEME_ACTS.map((act) => (
              <div key={act.id} className={styles.actCard}>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="race text-[#e7151e] text-3xl font-bold">
                    {act.num}
                  </span>
                  <span className="race text-[#5bcdbb] text-xl font-bold uppercase tracking-tight">
                    {act.title}
                  </span>
                </div>
                <p className="text-[#ebebeb]/85 text-sm md:text-base leading-relaxed">
                  {act.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performers Section */}
      <section className={styles.performersSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionIndex}>
            <span>02</span>
            <span className={styles.indexRule} />
            <span>Archive / past performers</span>
          </div>

          <SplitText
            as="h2"
            text="Echoes from previous editions"
            className={styles.sectionTitle}
            stagger={0.06}
          />

          <div className={styles.performerList}>
            {performers.map((performer, idx) => (
              <Reveal
                key={performer.name}
                className={styles.performerRow}
                y={54}
                delay={0.03 * idx}
              >
                <span className={styles.performerIndex}>
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div className={styles.performerMedia}>
                  <img
                    id={`performer-${idx}-img-current`}
                    src={performer.images[0]}
                    alt={performer.name}
                    style={{ zIndex: 2 }}
                  />
                  <img
                    id={`performer-${idx}-img-next`}
                    src={performer.images[0]}
                    alt=""
                    aria-hidden="true"
                    style={{ transform: "translateX(100%)", zIndex: 1 }}
                  />
                  <div className={styles.performerVeil} />
                  <span className={styles.performerStamp}>
                    Archive / Live
                  </span>
                </div>

                <div className={styles.performerNameWrap}>
                  <SplitText
                    as="h3"
                    text={performer.name}
                    className={styles.performerName}
                    stagger={0.05}
                  />
                  <span className={styles.performerMeta}>
                    Past performer · Celesta
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className={`w-full ${styles.background2} py-16 px-4 md:px-20`}>
        {/* Theme Announcement Section */}

        {/*<section className="max-w-5xl mx-auto text-center mb-16 reveal-section">
          {" "}
          <h3 className="text-white text-4xl uppercase text-center mb-8 state-wide">
            {" "}
            Theme{" "}
          </h3>
          <h2 className="text-white text-4xl md:text-6xl font-extrabold uppercase mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            {" "}
            ANACHRONISTIC SYNCRETISM{" "}
          </h2>
          <div className="w-24 h-[2px] mx-auto mb-6 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <p className="text-gray-300 text-lg md:text-xl">
            {" "}
            Something exciting is coming. Stay tuned for the reveal.{" "}
          </p>{" "}
        </section>*/}
        <section className="max-w-7xl mx-auto mb-16 reveal-section">
          <h2 className="text-white text-4xl uppercase text-center mb-8 state-wide">
            Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-32 w-full place-items-center">
            {events.map((event, idx) => (
              <EventCard
                key={`event-${idx}`}
                event={event}
                onClick={() => setSelectedEvent(event)}
              />
            ))}
          </div>
          {selectedEvent && (
            <EventModal
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          )}
        </section>

        <section className="max-w-7xl mx-auto mb-16 reveal-section text-center">
          <h2 className="text-white text-4xl uppercase mb-8 state-wide">
            Official Merchandise
          </h2>
          <p className="text-gray-100 text-lg md:text-xl max-w-2xl leading-relaxed">
            {" "}
            Something special is in the making. <br /> Stay tuned for the
            official CELESTA merchandise reveal.{" "}
          </p>
          {/* <div className="flex justify-center items-center gap-6">
            <Image
              src="/images/merch4.png"
              alt="merch-front"
              width={350}
              height={350}
              className="inline-block hover:scale-110 transition-transform duration-300"
            />
            <Image
              src="/images/merch1.png"
              alt="merch-front"
              width={350}
              height={350}
              className="inline-block hover:scale-110 transition-transform duration-300"
            />
            <Image
              src="/images/merch2.png"
              alt="merch-front"
              width={350}
              height={350}
              className="inline-block hover:scale-110 transition-transform duration-300"
            />
            <Image
              src="/images/merch3.png"
              alt="merch-front"
              width={350}
              height={350}
              className="inline-block hover:scale-110 transition-transform duration-300"
            />
          </div> */}
        </section>

        <section className="w-full max-w-[900px] mx-auto mb-16 reveal-section">
          <h2 className="text-white text-4xl uppercase mb-6 text-center state-wide">
            CELESTA: Glimpse
          </h2>

          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] mx-auto mb-8 bg-black">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/5HM98tMfYdo?autoplay=1&mute=1&loop=1&playlist=5HM98tMfYdo"
              title="CELESTA Glimpse YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </section>
      </div>
    </div>
  );
}
