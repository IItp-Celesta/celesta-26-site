"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SplitText({
  text,
  as: Tag = "span",
  className = "",
  type = "words",
  trigger = "scroll",
  delay = 0,
  stagger = 0.06,
  y = 110,
  duration = 1.1,
}) {
  const ref = useRef(null);

  const units =
    type === "chars" ? Array.from(text) : text.split(/(\s+)/).filter(Boolean);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const targets = element.querySelectorAll("[data-split-unit]");
    if (!targets.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(targets, { autoAlpha: 1, y: 0, rotateX: 0 });
      return;
    }

    const tween = gsap.fromTo(
      targets,
      { autoAlpha: 0, y, rotateX: -18 },
      {
        autoAlpha: 1,
        y: 0,
        rotateX: 0,
        duration,
        delay,
        ease: "power4.out",
        stagger,
        scrollTrigger:
          trigger === "scroll"
            ? {
                trigger: element,
                start: "top 90%",
                toggleActions: "play none none none",
              }
            : undefined,
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, duration, stagger, trigger, y]);

  return (
    <Tag
      ref={ref}
      className={className}
      aria-label={text}
      style={{ display: "inline-block" }}
    >
      {units.map((unit, index) => {
        if (/^\s+$/.test(unit)) {
          return <span key={`space-${index}`}> </span>;
        }

        return (
          <span
            key={`${unit}-${index}`}
            aria-hidden="true"
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "top",
              paddingBottom: "0.08em",
            }}
          >
            <span
              data-split-unit
              style={{ display: "inline-block", willChange: "transform" }}
            >
              {unit}
            </span>
          </span>
        );
      })}
    </Tag>
  );
}
