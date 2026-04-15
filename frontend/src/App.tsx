import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format } from "date-fns";
import { parse } from "date-fns";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventForm from "./components/EventForm/EventForm";
import EventModal from "./components/Modal/Modal";
import CalendarToolbar from "./components/CalendarToolbar";

// Setup date-fns localizer
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const App = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const clickTimer = React.useRef<NodeJS.Timeout | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (showHint && selectedDate && !showModal) {
      // Find the selected cell
      const cell = document.querySelector(".selected-day");
      if (cell) {
        const rect = cell.getBoundingClientRect();
        // Position tooltip above the cell
        setTooltipPos({
          top: rect.top + window.scrollY - 40,
          left: rect.left + window.scrollX + rect.width / 2,
        });
      } else {
        setTooltipPos(null);
      }
    } else {
      setTooltipPos(null);
    }
  }, [showHint, selectedDate, showModal]);

  // Single/double click handler for slot
  const handleSelectSlot = (slotInfo: any) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      // Double click detected
      setSelectedDate(slotInfo.start);
      setShowModal(true);
      setShowHint(false);
      return;
    }
    // Single click: set timer
    setSelectedDate(slotInfo.start);
    setShowHint(true);
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      // Single click logic already handled
    }, 250); // 250ms window for double click
  };

  return (
    <div style={{ height: "100vh", padding: "2rem", position: "relative" }}>
      {/* Tooltip pop-up near selected date */}
      {tooltipPos && (
        <div
          style={{
            position: "absolute",
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: "translate(-50%, -100%)",
            background: "#e6e6f7", // accent color
            color: "#6a0572",
            fontWeight: "bold",
            fontSize: 12,
            border: "2px solid #6a0572",
            borderRadius: 8,
            padding: "8px 16px",
            boxShadow: "0 0 8px #6a0572",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          Double-click to add a new event.
        </div>
      )}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        components={{
          toolbar: (props) => (
            <CalendarToolbar
              {...props}
              onNewEvent={() => {
                setSelectedDate(null); // No date pre-selected
                setShowModal(true);
                setShowHint(false);
              }}
            />
          ),
        }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={(event) => {
          setShowHint(true);
        }}
        onDoubleClickEvent={(event) => {
          setSelectedDate(event.start ?? null);
          setShowModal(true);
          setShowHint(false);
        }}
        dayPropGetter={(date) => {
          if (
            selectedDate &&
            date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate()
          ) {
            return {
              className: "selected-day",
            };
          }
          return {};
        }}
      />
      <EventModal open={showModal} onClose={() => setShowModal(false)}>
        <EventForm
          mode="add"
          date={selectedDate ?? undefined}
          onSubmit={(event: any) => {
            // Append event to state
            setEvents((prev: Event[]) => [...prev, event]);
            setShowModal(false);
            setSelectedDate(null);
            setShowHint(false);
          }}
          onCancel={() => {
            setShowModal(false);
            setSelectedDate(null);
            setShowHint(false);
          }}
        />
      </EventModal>
    </div>
  );
};

export default App;
