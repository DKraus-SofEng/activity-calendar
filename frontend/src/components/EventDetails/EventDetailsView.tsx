import React from "react";
import DOMPurify from "dompurify";

interface EventDetailsViewProps {
  title: string;
  content: string; // HTML string
}

const EventDetailsView: React.FC<EventDetailsViewProps> = ({
  title,
  content,
}) => {
  return (
    <div className="event-details-view">
      <h2 className="event-title">{title}</h2>
      <div
        className="event-details-content"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
      />
    </div>
  );
};

export default EventDetailsView;
