import React, { useState } from "react";
import EventDetails from "../EventDetails/EventDetails";
import styles from "./EventForm.module.css";
import modalStyles from "../Modal/Modal.module.css";
import Button from "../Button/Button";
import Modal from "../Modal/Modal"; // Import the custom Modal component
import { FaPlus, FaMinus } from "react-icons/fa";

type EventFormProps = {
  event?: any; // renamed from initialEvent
  mode: "add" | "edit" | "copy";
  onSubmit: (event: any) => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onCancel: () => void;
  date?: Date; // Optional date prop for pre-filling
};

const EventForm: React.FC<EventFormProps> = ({
  event,
  mode,
  onSubmit,
  onDelete,
  onCopy,
  onCancel,
  date,
}) => {
  // Helper for date formatting
  const pad = (n: number) => n.toString().padStart(2, "0");

  const toISOStringLocal = (d: any) => {
    if (!d) return "";
    if (typeof d === "string") return d;
    // Date object
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

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
    return toISOStringLocal(event?.start) || "";
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
    return toISOStringLocal(event?.end) || toISOStringLocal(event?.start) || "";
  };

  const [title, setTitle] = useState(event?.title || "");
  const [start, setStart] = useState(getDefaultStart());
  const [end, setEnd] = useState(getDefaultEnd());
  const [details, setdetails] = useState(event?.details || "");
  const [repeat, setRepeat] = useState(event?.repeat || "none");
  const [reminders, setReminders] = useState(event?.reminders || []);
  const [reminderInput, setReminderInput] = useState("");
  const [customReminder, setCustomReminder] = useState("");
  const [activityType, setActivityType] = useState(
    event?.activityType || "Zoom",
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [multiDay, setMultiDay] = useState(false);
  const [endDate, setEndDate] = useState(start.split("T")[0]);

  // Track if user has manually changed end time
  const [endManuallyChanged, setEndManuallyChanged] = useState(false);

  // Center dialogs on open, but a bit higher
  const mainDialogInitial = {
    x: window.innerWidth / 2 - 200,
    y: window.innerHeight / 2 - 220,
  };
  const detailsDialogInitial = {
    x: window.innerWidth / 2 - 180,
    y: window.innerHeight / 2 - 120,
  };

  // Reset endManuallyChanged when opening for a new event or when start date changes
  React.useEffect(() => {
    setEndManuallyChanged(false);
  }, [mode, date, event]);

  const generateTimeOptions12hr = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        const ampm = h < 12 ? "AM" : "PM";
        const min = m.toString().padStart(2, "0");
        options.push({
          value: `${pad(h)}:${min}`,
          label: `${hour12}:${min} ${ampm}`,
        });
      }
    }
    return options;
  };

  // Helper: parse time string (e.g., "6:20 pm", "18:20", "8a", "8p") to 24hr (e.g., "18:20")
  function parseTimeInput(str: string): string {
    if (!str) return "";
    str = str.trim().toLowerCase();
    // Accepts am/pm or just a/p (e.g., 8a, 8p, 8:15a, 8:15pm)
    let match = str.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap](?:m)?)?$/);
    if (!match) return "";
    let [, hStr, mStr, ampm] = match;
    let h = parseInt(hStr || "0", 10);
    let m = mStr ? parseInt(mStr, 10) : 0;
    if (ampm) {
      if ((ampm === "pm" || ampm === "p") && h !== 12) h += 12;
      if ((ampm === "am" || ampm === "a") && h === 12) h = 0;
    }
    if (h > 23 || m > 59) return "";
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  // Helper: format 24hr (e.g., "18:20") to 12hr (e.g., "6:20 PM")
  function format24hrTo12hr(timeStr: string): string {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  type TimeInputComboProps = {
    value: string;
    onChange: (val: string) => void;
    id: string;
    label: string;
  };

  function TimeInputCombo({ value, onChange, id, label }: TimeInputComboProps) {
    // value is always 24hr string (e.g., "18:00")
    const [input, setInput] = useState(value ? format24hrTo12hr(value) : "");

    React.useEffect(() => {
      setInput(value ? format24hrTo12hr(value) : "");
    }, [value]);

    // Dropdown for whole hours
    const hourOptions: string[] = [];
    for (let h = 1; h <= 12; h++) {
      hourOptions.push(`${h}:00 AM`);
      hourOptions.push(`${h}:00 PM`);
    }

    const handleDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setInput(e.target.value);
      const parsed = parseTimeInput(e.target.value);
      if (parsed) onChange(parsed);
    };

    // +/- buttons for 15-min increments
    const adjust = (delta: number) => {
      let parsed = parseTimeInput(input);
      if (!parsed) parsed = "12:00";
      let [h, m] = parsed.split(":").map(Number);
      let total = h * 60 + m + delta;
      if (total < 0) total += 24 * 60;
      if (total >= 24 * 60) total -= 24 * 60;
      h = Math.floor(total / 60);
      m = total % 60;
      const newVal = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      setInput(format24hrTo12hr(newVal));
      onChange(newVal);
    };

    return (
      <span className={styles.timeInputCombo}>
        <select
          className={`${styles.eventInput} ${styles.timeDropdown}`}
          value={hourOptions.find((opt) => opt === input) || ""}
          onChange={handleDropdown}
          tabIndex={-1}
          aria-label={label + " hour dropdown"}
          size={1}
        >
          <option value="">--:--</option>
          {hourOptions.map((opt) => (
            <option key={opt} value={opt} className={styles.timeDropdownOption}>
              {opt}
            </option>
          ))}
        </select>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => adjust(15)}
          className={styles.timeAdjustBtn}
          aria-label={`Increase ${label} by 15 minutes`}
        >
          <FaPlus size={12} />
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => adjust(-15)}
          className={styles.timeAdjustBtn}
          aria-label={`Decrease ${label} by 15 minutes`}
        >
          <FaMinus size={12} />
        </button>
      </span>
    );
  }

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
              <TimeInputCombo
                id="event-start-time"
                label="Start Time"
                value={start.split("T")[1] || ""}
                onChange={(val) => {
                  const dateStr = start.split("T")[0];
                  setStart(dateStr + "T" + val);
                  if (!endManuallyChanged) {
                    // Set end to 1 hour after start
                    const [h, m] = val.split(":").map(Number);
                    let endH = h + 1;
                    let endM = m;
                    if (endH > 23) endH = 23;
                    const endTime = `${pad(endH)}:${pad(endM)}`;
                    setEnd(dateStr + "T" + endTime);
                  }
                }}
              />
              <span className={styles.toLabel}>to</span>
              <TimeInputCombo
                id="event-end-time"
                label="End Time"
                value={end.split("T")[1] || ""}
                onChange={(val) => {
                  setEnd(end.split("T")[0] + "T" + val);
                  setEndManuallyChanged(true);
                }}
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
                <label htmlFor="event-repeat" className={styles.eventLabel}>
                  Repeat:
                </label>
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
                <label htmlFor="event-type" className={styles.eventLabel}>
                  Event Type:
                </label>
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
            <label htmlFor="event-reminder" className={styles.eventLabel}>
              Reminders:
            </label>
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
