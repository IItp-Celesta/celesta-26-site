import Image from "next/image";
import styles from './Workshops.module.css';

export default function WorkshopCard({ name, img_src, onView }) {
  return (
    <div className={styles.eventCardWrapper}>
      <div className={styles.eventCardBorder}></div>
      <div className={styles.eventCardContent}>

        {/* Image Section */}
        <div className={styles.eventImageContainer}>
          <Image
            src={img_src}
            alt={name}
            className={styles.eventImage}
            width={500}
            height={300}
          />
          <div className={styles.eventImageOverlay}></div>
        </div>

        {/* Info Section */}
        <div className={styles.eventInfo}>
          <h1 className={styles.eventName}>{name}</h1>
        </div>

        {/* View Button */}
        <div className={styles.registerButtonContainer}>
          <button onClick={onView} className={styles.registerButton}>
            View
          </button>
        </div>

      </div>
    </div>
  );
}