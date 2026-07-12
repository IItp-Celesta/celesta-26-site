"use client";

import { useState } from "react";
import WorkshopCard from "./workshop-card";
import WorkshopModal from "./workshop-modal";
import styles from "./Workshops.module.css";
import data from "./workshops.json";

export default function Workshop() {
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const workshops = data["workshops"];

  return (
    <div
      className={`bg-muted flex flex-col min-h-svh gap-8 px-4 md:px-10 pb-32 ${styles.background} text-white w-full overflow-x-hidden relative`}
    >
      <div className="absolute inset-0 z-0 opacity-50 mask-[radial-gradient(ellipse_at_center,transparent_20%,white_100%)] pointer-events-none">
        <svg
          className="absolute inset-0 h-full w-full text-white"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M32 0H0V32"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              ></path>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"></rect>
        </svg>
      </div>
      <h1 className="race font-bold text-5xl md:text-7xl text-center mb-12 mt-[15vh] bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 w-full uppercase">
        WORKSHOPS
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 w-full place-items-center">
        {workshops.map((workshop, idx) => (
          <WorkshopCard
            key={idx}
            name={workshop.name}
            img_src={workshop.img_src}
            onView={() => setSelectedWorkshop(workshop)}
          />
        ))}
      </div>

      {selectedWorkshop && (
        <WorkshopModal
          workshop={selectedWorkshop}
          onClose={() => setSelectedWorkshop(null)}
        />
      )}
    </div>
  );
}
