import React from "react";
import styles from "./Event.module.css";

const Event = ({ event }: { event: any }) => (
  <div className={styles.eventRoot}>
    {event.thumbnailURL && (
      <img src={event.thumbnailURL} alt="" className={styles.eventIcon} />
    )}

    <div className={styles.eventContent}>
      <div>
        <span className={styles.eventType}>{event.activityType}</span>
        <b className={styles.eventTitle}>{event.title}</b>
      </div>
      {event.startTime && event.endTime && (
        <div className={styles.eventTime}>
          {event.startTime} - {event.endTime}
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
