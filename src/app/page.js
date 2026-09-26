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
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

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

  return (
    <div className="overflow-x-hidden w-full">
      {/* Banner Section */}
      <div
        className={`flex flex-col justify-center items-center ${styles.background}`}
      >
        <section className="flex h-[90vh] justify-center items-center w-full">
          <Image
            className="translate-y-[30px]"
            ref={fadeRef}
            src="/images/banner-logo.png"
            alt="banner-logo"
            width={1000}
            height={500}
          />
        </section>
        <ArrowDown className="text-white animate-bounce" />
      </div>

      {/* Performers Section */}
      <div className={`flex flex-col ${styles.background2} w-full`}>
        <h1 className="text-white font-bold text-6xl sm:text-5xl text-center my-20 reveal-section state-wide">
          Past Performers
        </h1>
        <div className="w-full">
          {performers.map((performer, idx) => (
            <div
              key={idx}
              className="relative w-full h-[500px] overflow-hidden reveal-section"
            >
              {/* Slideshow */}
              <img
                id={`performer-${idx}-img-current`}
                className="absolute inset-0 w-full h-full object-cover"
                src={performer.images[0]}
                alt={performer.name}
                style={{ zIndex: 2 }}
              />
              <img
                id={`performer-${idx}-img-next`}
                className="absolute inset-0 w-full h-full object-cover"
                src={performer.images[0]}
                alt={performer.name}
                style={{ transform: "translateX(100%)", zIndex: 1 }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 z-10" />

              {/* Artist Name */}
              <div
                className={`absolute inset-0 flex items-center z-20 px-4 sm:px-10 md:px-20 justify-${
                  idx % 2 === 0 ? "start" : "end"
                }`}
              >
                <h2
                  id={`performer-name-${idx}`}
                  className="text-white font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wider uppercase drop-shadow-2xl break-words state-wide"
                >
                  {performer.name}
                </h2>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`w-full ${styles.background2} py-16 px-4 md:px-20`}>
        {/* Theme Announcement Section */}

        <section className="max-w-5xl mx-auto text-center mb-16 reveal-section">
          {" "}
          <h3 className="text-white text-4xl uppercase text-center mb-8 state-wide">
            {" "}
            Theme{" "}
          </h3>
          <h2 className="text-white text-4xl md:text-6xl font-extrabold uppercase mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            {" "}
            To Be Announced{" "}
          </h2>
          <div className="w-24 h-[2px] mx-auto mb-6 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <p className="text-gray-300 text-lg md:text-xl">
            {" "}
            Something exciting is coming. Stay tuned for the reveal.{" "}
          </p>{" "}
        </section>
        <section className="max-w-7xl mx-auto mb-16 reveal-section">
          <h2 className="text-white text-4xl uppercase text-center mb-8 state-wide">
            Events
          </h2>
          <p className="text-gray-100 text-lg md:text-xl">
            {" "}
            Incoming Soon....
          </p>
          {/* <Swiper
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
          </Swiper> */}

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
              allowFullScreen>
            </iframe>
          </div>
        </section>
      </div>
    </div>
  );
}