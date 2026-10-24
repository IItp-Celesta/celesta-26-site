"use client";

import EventCard from "./events/event-card";
import EventModal from "./events/event-modal";
import Image from "next/image";
import styles from "./Home.module.css";
import { ArrowDown } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "./events/events.json";
import SplitText from "@/components/theme/SplitText";
import Reveal from "@/components/theme/Reveal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

gsap.registerPlugin(ScrollTrigger);

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

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const events = data["events"];
  const fadeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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

      gsap.fromTo(
        fadeRef.current,
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1.5, ease: "power2.out" },
      );
    });

    return () => ctx.revert();
  }, []);

  // Image slideshow
  const [indexes, setIndexes] = useState(performers.map(() => 0));

  useEffect(() => {
    const id = setInterval(() => {
      setIndexes((prev) =>
        prev.map((i, idx) => (i + 1) % performers[idx].images.length),
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const THEME_COPY =
    "Celesta 2026 embraces the theme “Anachronistic Syncretism,” a celebration of the seamless fusion of ideas, technologies, and aesthetics from the past, present, and future. It envisions a world where the boundaries of time dissolve, allowing ancient wisdom, forgotten innovations, modern scientific breakthroughs, and futuristic possibilities to converge and create something extraordinary. The theme explores how ideas from different eras can coexist, interact, and evolve, challenging conventional perceptions of time and progress. Through three acts, Anachronistic Syncretism celebrates the limitless potential of human imagination. At its core, the theme reflects the spirit of Celesta: a space where science meets creativity, disciplines intersect, and innovation transcends the boundaries of time to shape the future.";

  const THEME_ACTS = [
    {
      id: 1,
      num: "01",
      title: "The Zenith",
      desc: "Symbolising the pursuit of ultimate knowledge",
    },
    {
      id: 2,
      num: "02",
      title: "The Cascade",
      desc: "Representing the flow and transformation of ideas across eras",
    },
    {
      id: 3,
      num: "03",
      title: "Convergence",
      desc: "Where seemingly disconnected timelines and innovations unite to shape a new reality.",
    },
  ];

  return (
    <div className="overflow-x-clip w-full relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/back.png"
          alt=""
          fill
          className="object-cover object-center hidden md:block"
        />
        <Image
          src="/images/mobile.png"
          alt=""
          fill
          className="object-cover object-center md:hidden"
        />
        <div className="absolute inset-0 bg-black/45" />
      </div>

      {/* 2. HERO SECTION */}
      <div
        className={`flex flex-col justify-center items-center ${styles.background} w-full relative z-10`}
      >
        <section className="flex h-[90vh] justify-center items-center w-full px-4">
          <h1>
            <Image
              className="translate-y-[30px] max-w-full h-auto"
              ref={fadeRef}
              src="/images/typeface.svg"
              alt="Celesta"
              width={1000}
              height={500}
              priority
            />
          </h1>
        </section>
        <ArrowDown className="text-[#5bcdbb] mb-8 animate-bounce" />
      </div>

      <div className="relative z-10 w-full">
        {/* Performers Section */}
        <section className={styles.performersSection}>
          <div className={styles.sectionInner}>
            <SplitText
              as="h2"
              text="Echoes from Previous Editions"
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
                    {performer.images.map((src, i) => {
                      const len = performer.images.length;
                      const cur = indexes[idx];
                      const prev = (cur - 1 + len) % len;
                      const dir = idx % 2 === 0 ? 1 : -1;
                      const x =
                        i === cur ? 0 : i === prev ? 100 * dir : -100 * dir;

                      return (
                        <Image
                          key={src}
                          src={src}
                          alt={i === cur ? performer.name : ""}
                          fill
                          sizes="(min-width: 860px) 55vw, 100vw"
                          style={{
                            transform: `translateX(${x}%)`,
                            transition:
                              i === cur || i === prev
                                ? "transform 1s ease-in-out, filter 0.8s ease"
                                : "none",
                          }}
                        />
                      );
                    })}
                    <div className={styles.performerVeil} />
                  </div>

                  <div className={styles.performerNameWrap}>
                    <SplitText
                      as="h3"
                      text={performer.name}
                      className={styles.performerName}
                      stagger={0.05}
                    />
                    <span className={styles.performerMeta}>
                      Past Performer • Celesta
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Theme Section */}
        <section className={styles.themeSection}>
          <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 text-center">
            <p className="text-[#5bcdbb] uppercase tracking-[0.3em] text-xs md:text-lg mb-6">
              The Theme
            </p>
            <h2 className="race text-4xl sm:text-5xl md:text-6xl font-bold uppercase mb-10 text-[#ebebeb]">
              Anachronistic Syncretism
            </h2>
            <p className="text-[#ebebeb]/90 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-14 text-justify hyphens-auto">
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
        <section className="max-w-7xl mx-auto mt-16 mb-16 px-4 md:px-20 reveal-section">
          <h2 className="text-white text-4xl uppercase text-center mb-8 state-wide">
            Events
          </h2>
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            navigation
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="px-4 events-swiper"
            centeredSlides
            loop
            grabCursor
          >
            {events.map((event, idx) => (
              <SwiperSlide key={idx}>
                <div className="flex justify-center">
                  <EventCard
                    event={event}
                    onClick={() => setSelectedEvent(event)}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {selectedEvent && (
            <EventModal
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          )}
        </section>

        {/*<section className="max-w-7xl mx-auto mb-16 reveal-section text-center">
            <h2 className="text-white text-4xl uppercase mb-8 state-wide">
              Official Merchandise
            </h2>
            <p className="text-gray-100 text-lg md:text-xl max-w-2xl leading-relaxed">
              {" "}
              Something special is in the making. <br /> Stay tuned for the
              official CELESTA merchandise reveal.{" "}
            </p>
           <div className="flex justify-center items-center gap-6">
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
          </div> 
          </section>*/}

        <section className="w-full max-w-[900px] mx-auto mb-16 px-4 reveal-section">
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
