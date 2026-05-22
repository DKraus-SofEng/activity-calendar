import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, ToolbarProps } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
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
import Button from "./components/Button/Button";

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

const DnDCalendar = withDragAndDrop(Calendar);

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
          const endDatePart =
            !a.endDate || a.endDate.split("T")[0] === datePart
              ? datePart
              : a.endDate.split("T")[0];
          // Fallback to "00:00" if time is missing
          const startTime = a.startTime || "00:00";
          const endTime = a.endTime || startTime;
          return {
            id: a._id,
            start: new Date(datePart + "T" + startTime),
            end: new Date(endDatePart + "T" + endTime),
            ...a,
            thumbnailUrl: a.thumbnailUrl,
          };
        });
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

  const handleEventDrop = ({ event, start, end, allDay }: any) => {
    // Update event's date fields for single or multi-day
    const newDate = start.toISOString().slice(0, 10);
    const newEndDate = end.toISOString().slice(0, 10);
    const updatedEvent = {
      ...event,
      start,
      end,
      date: newDate,
      endDate: newEndDate !== newDate ? newEndDate : undefined,
      startTime: start.toISOString().slice(11, 16),
      endTime: end.toISOString().slice(11, 16),
    };

    updateActivity(event.id, {
      ...event,
      date: updatedEvent.date,
      endDate: updatedEvent.endDate,
      startTime: updatedEvent.startTime,
      endTime: updatedEvent.endTime,
    })
      .then(() => {
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e.id === event.id ? { ...e, ...updatedEvent } : e,
          ),
        );
      })
      .catch((err) => {
        alert("Failed to update event position");
        console.error(err);
      });
  };

  // Handlers for delete and copy
  const handleDelete = async () => {
    if (editingEvent && editingEvent.id) {
      await deleteActivity(editingEvent.id);
      setEvents((prev) => prev.filter((e) => e.id !== editingEvent.id));
      setShowModal(false);
      setEditingEvent(null);
    }
  };

  const handleCopy = () => {
    if (!editingEvent) return;
    setEditingEvent(null);
    setShowModal(true);
    setTimeout(() => {
      setEditingEvent({
        ...editingEvent,
        id: undefined,
        title: `${editingEvent.title} (Copy)`,
      });
    }, 0);
  };

  return (
    <div
      className="calendar-container"
      style={{ height: "900px", padding: "2rem", position: "relative" }}
    >
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
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor={(event: CalEvent) => event.start ?? new Date()}
        endAccessor={(event: CalEvent) => event.end ?? new Date()}
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
          setEditingEvent(event as any); // Ensure editingEvent is set so modal buttons show
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
        onEventDrop={handleEventDrop}
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
              details: event.details || "",
              date: event.date,
              startTime: event.startTime,
              endTime: event.endTime,
              activityType: event.activityType,
              thumbnailUrl: event.thumbnailUrl,
              // Only include endDate if it's present and different from date
              ...(event.endDate && event.endDate !== event.date
                ? { endDate: event.endDate }
                : {}),
              // ...add other fields as needed
            };
            try {
              let saved: any;
              if (editingEvent && editingEvent.id) {
                saved = await updateActivity(editingEvent.id, backendActivity);
                setEvents((prev: any[]) =>
                  prev.map((e) => {
                    // Use saved.date and saved.endDate, but if endDate is missing or same as date, treat as single-day
                    const startDateStr = saved.date;
                    const endDateStr =
                      !saved.endDate || saved.endDate === saved.date
                        ? saved.date
                        : saved.endDate;
                    return e.id === editingEvent.id
                      ? {
                          ...e,
                          ...event,
                          id: saved._id,
                          start: new Date(startDateStr + "T" + saved.startTime),
                          end: new Date(endDateStr + "T" + saved.endTime),
                        }
                      : e;
                  }),
                );
              } else {
                saved = await addActivity(backendActivity);
                setEvents((prev: any[]) => [
                  ...prev,
                  {
                    ...saved,
                    id: saved._id,
                    start: new Date(
                      saved.date.split("T")[0] +
                        "T" +
                        (saved.startTime || "00:00"),
                    ),
                    end: new Date(
                      (!saved.endDate || saved.endDate === saved.date
                        ? saved.date
                        : saved.endDate
                      ).split("T")[0] +
                        "T" +
                        (saved.endTime || saved.startTime || "00:00"),
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
          onDelete={editingEvent ? handleDelete : undefined}
          onCopy={editingEvent ? handleCopy : undefined}
        />
      </EventModal>
    </div>
  );
};

export default App;
