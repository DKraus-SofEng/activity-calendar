import React from "react";
import styles from "./Event.module.css";

function formatTime12hr(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

const Event = ({ event }: { event: any }) => (
  <div className={styles.eventRoot}>
    {event.thumbnailUrl && (
      <img src={event.thumbnailUrl} alt="" className={styles.eventIcon} />
    )}

    <div className={styles.eventContent}>
      <div>
        <b className={styles.eventTitle}>{event.title}</b>
      </div>
      {event.startTime && event.endTime && (
        <div className={styles.eventTime}>
          {formatTime12hr(event.startTime)} - {formatTime12hr(event.endTime)}
        </div>
      )}
      <button
        className={styles.descriptionButton}
        onClick={(e) => {
          e.stopPropagation();
          // You can trigger your modal or details view here
          // For example: openDetails(event)
        }}
        tabIndex={-1}
      >
        Description
      </button>
    </div>
  </div>
);

export default Event;
