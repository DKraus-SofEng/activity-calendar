import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, ToolbarProps } from "react-big-calendar";
import { format, parse } from "date-fns";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventForm from "./components/EventForm/EventForm";
import EventModal from "./components/Modal/Modal";
import CalendarToolbar from "./components/CalendarToolbar";
import {
  fetchActivities,
  addActivity,
  updateActivity,
  deleteActivity,
  Activity as BackendActivity,
} from "./api/activitiesApi";
import Event from "./components/Event/Event";

// Define CalEvent interface for calendar events
export interface CalEvent {
  id?: string;
  title?: React.ReactNode;
  start?: Date;
  end?: Date;
  details?: string;
  date?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  activityType?: string;
  thumbnailUrl?: string;
  [key: string]: any;
}

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
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);

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

  // Fetch activities from backend on mount
  useEffect(() => {
    fetchActivities()
      .then((activities) => {
        // Convert backend activities to calendar events
        const mappedEvents = activities.map((a) => {
          const datePart = a.date.split("T")[0];
          const endDatePart = a.endDate ? a.endDate.split("T")[0] : datePart;
          return {
            id: a._id,
            start: new Date(datePart + "T" + a.startTime),
            end: new Date(endDatePart + "T" + a.endTime),
            ...a,
            thumbnailUrl: a.thumbnailUrl,
          };
        });
        console.log("Mapped events for calendar:", mappedEvents); // Debug log
        setEvents(mappedEvents);
      })
      .catch((err) => {
        // Optionally show error
        console.error("Failed to fetch activities", err);
      });
  }, []);

  // Single/double click handler for slot
  const handleSelectSlot = (slotInfo: any) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      // Double click detected
      setSelectedDate(slotInfo.start);
      setEditingEvent(null);
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
      <Calendar<CalEvent>
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        components={{
          event: Event, // Use custom event component
          toolbar: (props: ToolbarProps<CalEvent, object>) => (
            <CalendarToolbar
              {...props}
              onNewEvent={() => {
                setSelectedDate(null); // No date pre-selected
                setEditingEvent(null);
                setShowModal(true);
                setShowHint(false);
              }}
            />
          ),
        }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={(event) => {
          // show hint on single select
          setShowHint(true);
        }}
        onDoubleClickEvent={(event) => {
          // Open modal for editing the clicked event
          setEditingEvent(event as any);
          setSelectedDate((event as any).start ?? null);
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
      <EventModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEvent(null);
        }}
      >
        <EventForm
          mode={editingEvent ? "edit" : "add"}
          date={selectedDate ?? undefined}
          event={editingEvent ?? undefined}
          onSubmit={async (event: any) => {
            // Prepare backend activity
            const backendActivity: BackendActivity = {
              title: event.title,
              details: event.details || "", // Ensure details is always a string
              date: event.date, // Use date from EventForm
              startTime: event.startTime,
              endTime: event.endTime,
              activityType: event.activityType,
              thumbnailUrl: event.thumbnailUrl,
              // reminders: event.reminders, // Remove or add to BackendActivity type if needed
              // ...add other fields as needed
            };
            try {
              let saved: any;
              if (editingEvent && editingEvent.id) {
                saved = await updateActivity(editingEvent.id, backendActivity);
                setEvents((prev: any[]) =>
                  prev.map((e) =>
                    e.id === editingEvent.id
                      ? {
                          ...e,
                          ...event,
                          id: saved._id,
                          start: new Date(saved.date + "T" + saved.startTime),
                          end: new Date(
                            (saved.endDate || saved.date) + "T" + saved.endTime,
                          ),
                        }
                      : e,
                  ),
                );
              } else {
                saved = await addActivity(backendActivity);
                setEvents((prev: any[]) => [
                  ...prev,
                  {
                    ...event,
                    id: saved._id,
                    start: new Date(saved.date + "T" + saved.startTime),
                    end: new Date(
                      (saved.endDate || saved.date) + "T" + saved.endTime,
                    ),
                  },
                ]);
              }
            } catch (err) {
              alert("Failed to save event");
            }
            setShowModal(false);
            setSelectedDate(null);
            setShowHint(false);
            setEditingEvent(null);
          }}
          onCancel={() => {
            setShowModal(false);
            setSelectedDate(null);
            setShowHint(false);
            setEditingEvent(null);
          }}
        />
      </EventModal>
    </div>
  );
};

export default App;
