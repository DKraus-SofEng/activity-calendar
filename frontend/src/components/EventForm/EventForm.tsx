import React, { useState } from "react";
import EventDetails from "../EventDetails/EventDetails";
import styles from "./EventForm.module.css";
import modalStyles from "../Modal/Modal.module.css";
import Button from "../Button/Button";
import Modal from "../Modal/Modal"; // Import the custom Modal component

type EventFormProps = {
  initialEvent?: any; // TODO:  refine later
  mode: "add" | "edit" | "copy";
  onSubmit: (event: any) => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onCancel: () => void;
  date?: Date; // Optional date prop for pre-filling
};

const EventForm: React.FC<EventFormProps> = ({
  initialEvent,
  mode,
  onSubmit,
  onDelete,
  onCopy,
  onCancel,
  date,
}) => {
  // Helper for date formatting
  const pad = (n: number) => n.toString().padStart(2, "0");

  // Pre-fill start/end if mode is add and date is provided
  const getDefaultStart = () => {
    if (mode === "add" && date) {
      const yyyy = date.getFullYear();
      const mm = pad(date.getMonth() + 1);
      const dd = pad(date.getDate());
      const hh = pad(date.getHours());
      const min = pad(date.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }
    return initialEvent?.start || "";
  };
  const getDefaultEnd = () => {
    if (mode === "add" && date) {
      const endDate = new Date(date.getTime() + 60 * 60 * 1000);
      const yyyy = endDate.getFullYear();
      const mm = pad(endDate.getMonth() + 1);
      const dd = pad(endDate.getDate());
      const hh = pad(endDate.getHours());
      const min = pad(endDate.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }
    return initialEvent?.end || initialEvent?.start || "";
  };

  const [title, setTitle] = useState(initialEvent?.title || "");
  const [start, setStart] = useState(getDefaultStart());
  const [end, setEnd] = useState(getDefaultEnd());
  const [details, setdetails] = useState(initialEvent?.details || "");
  const [repeat, setRepeat] = useState(initialEvent?.repeat || "none");
  const [reminders, setReminders] = useState(initialEvent?.reminders || []);
  const [reminderInput, setReminderInput] = useState("");
  const [customReminder, setCustomReminder] = useState("");
  const [activityType, setActivityType] = useState(
    initialEvent?.activityType || "Zoom",
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [multiDay, setMultiDay] = useState(false);
  const [endDate, setEndDate] = useState(start.split("T")[0]);

  // Center dialogs on open, but a bit higher
  const mainDialogInitial = {
    x: window.innerWidth / 2 - 200,
    y: window.innerHeight / 2 - 220,
  };
  const detailsDialogInitial = {
    x: window.innerWidth / 2 - 180,
    y: window.innerHeight / 2 - 120,
  };

  return (
    <>
      {/* Main Event Modal */}
      <Modal
        open={true}
        onClose={onCancel}
        initialPosition={mainDialogInitial}
        title="New Event"
        content={
          <form
            className={styles.eventForm}
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit({
                title,
                start,
                end,
                details,
                repeat,
                reminders,
                activityType,
              });
            }}
          >
            {/* Title label above input */}
            <label htmlFor="event-title" className={styles.eventLabel}>
              Title:
            </label>
            <input
              className={`${styles.eventInput} ${styles.title}`}
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Event title"
            />
            {/* Date label above date row */}
            <label htmlFor="event-date" className={styles.eventLabel}>
              Date:
            </label>
            <div className={styles.dateCheckboxRow}>
              <input
                type="date"
                id="event-date"
                className={`${styles.eventInput} ${styles.dateInput}`}
                value={start.split("T")[0]}
                onChange={(e) => {
                  const dateStr = e.target.value;
                  setStart(dateStr + start.slice(start.indexOf("T")));
                  setEnd(dateStr + end.slice(end.indexOf("T")));
                  setEndDate(dateStr);
                }}
              />
              <label className={styles.multiDayCheckboxLabel}>
                <input
                  type="checkbox"
                  className={styles.eventCheckbox}
                  checked={multiDay}
                  onChange={() => setMultiDay(!multiDay)}
                />
                <span className={styles.multiDayLabel}>
                  {multiDay ? "thru" : "lasts more than one day"}
                </span>
              </label>
              {multiDay && (
                <input
                  type="date"
                  className={`${styles.eventInput} ${styles.dateInput}`}
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setEnd(e.target.value + end.slice(end.indexOf("T")));
                  }}
                />
              )}
            </div>
            {/* Start/End times with to */}
            <label htmlFor="event-start-time" className={styles.eventLabel}>
              Start Time:
            </label>
            <div className={styles.timeRow}>
              <input
                type="time"
                id="event-start-time"
                className={styles.eventInput}
                value={start.split("T")[1] || ""}
                onChange={(e) => {
                  setStart(start.split("T")[0] + "T" + e.target.value);
                }}
                required
              />
              <span className={styles.toLabel}>to</span>
              <input
                type="time"
                className={styles.eventInput}
                value={end.split("T")[1] || ""}
                onChange={(e) => {
                  setEnd(end.split("T")[0] + "T" + e.target.value);
                }}
                required
              />
            </div>
            {/* Repeat and event type on same line, aligned */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 8,
                alignItems: "flex-end",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              >
                <label htmlFor="event-repeat">Repeat:</label>
                <select
                  id="event-repeat"
                  className={styles.eventInput}
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                >
                  <option value="none">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              >
                <label htmlFor="event-type">Event Type:</label>
                <select
                  id="event-type"
                  className={styles.eventInput}
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                >
                  <option value="">Select event type</option>
                  <option value="Zoom">Zoom</option>
                  <option value="In-person">In-person</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <label htmlFor="event-reminder">Reminders:</label>
            <div className={styles.reminderListRow}>
              <select
                id="event-reminder"
                className={styles.eventInput}
                value={reminderInput}
                onChange={(e) => setReminderInput(e.target.value)}
              >
                <option value="">Select reminder</option>
                <option value="10 min">10 min</option>
                <option value="30 min">30 min</option>
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="1 day">1 day</option>
                <option value="Custom">Custom</option>
              </select>
              {reminderInput === "Custom" && (
                <input
                  type="text"
                  className={`${styles.eventInput} ${styles.reminderInput}`}
                  placeholder="Enter custom reminder"
                  value={customReminder}
                  onChange={(e) => setCustomReminder(e.target.value)}
                />
              )}
              <Button
                type="button"
                onClick={() => {
                  const value =
                    reminderInput === "Custom" ? customReminder : reminderInput;
                  if (value && !reminders.includes(value)) {
                    setReminders([...reminders, value]);
                    setReminderInput("");
                    setCustomReminder("");
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className={styles.reminderList}>
              {reminders.map((r: string, idx: number) => (
                <span key={idx} className={styles.reminderChip}>
                  {r}
                  <Button
                    type="button"
                    variant="utility"
                    onClick={() =>
                      setReminders(
                        reminders.filter((rem: string, i: number) => i !== idx),
                      )
                    }
                  >
                    ×
                  </Button>
                </span>
              ))}
            </div>
            {/* Add details button and conditional details field */}
            <div>
              <Button
                type="button"
                variant="utility"
                className={styles.addDetails}
                onClick={() => setShowDetailsModal(true)}
              >
                {details ? "Edit Details" : "Add Details"}
              </Button>
            </div>
            {/* Save and Cancel buttons aligned right, moved up */}
            <div className={styles.eventFormBtnRow}>
              <Button type="submit">Save Event</Button>
              <Button type="button" variant="cancel" onClick={onCancel}>
                Cancel
              </Button>
              {mode === "edit" && onDelete && (
                <Button type="button" variant="delete" onClick={onDelete}>
                  Delete
                </Button>
              )}
              {mode === "edit" && onCopy && (
                <Button type="button" variant="copy" onClick={onCopy}>
                  Copy
                </Button>
              )}
            </div>
          </form>
        }
      />
      {/* Details Modal - compact, not draggable, no nested form */}
      {showDetailsModal && (
        <Modal
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          initialPosition={detailsDialogInitial}
          title="Event Details"
          draggable={true}
          className={modalStyles.detailsModal}
          content={
            <EventDetails
              initialTitle={title}
              initialContent={details}
              onSave={(newTitle, newDetails) => {
                setTitle(newTitle);
                setdetails(newDetails);
                setShowDetailsModal(false);
              }}
              onCancel={() => setShowDetailsModal(false)}
              compact
            />
          }
        />
      )}
    </>
  );
};

export default EventForm;
