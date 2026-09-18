"use client";

import Image from "next/image";
import styles from "./Events.module.css";

export default function EventCard({ event, onClick }) {
  return (
    <div className={styles.eventCardWrapper} onClick={onClick}>
      <div className={styles.eventCardBorder}></div>
      <div className={styles.eventCardContent}>
        <div className={styles.eventImageContainer}>
          <Image
            src={event.img_src}
            alt={event.name}
            fill
            sizes="320px"
            className={styles.eventImage}
          />
          <div className={styles.eventImageOverlay}></div>
        </div>

        <div className={styles.eventInfo}>
          <h1 className={styles.eventName}>{event.name}</h1>
        </div>

        <div className={styles.registerButtonContainer}>
          <button className={styles.registerButton}>View</button>
        </div>
      </div>
    </div>
  );
}
