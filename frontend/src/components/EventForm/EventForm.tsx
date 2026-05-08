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
  const [startDate, setStartDate] = useState(
    typeof event?.date === "string" && event?.date.includes("T")
      ? event.date.split("T")[0]
      : typeof event?.date === "string"
        ? event.date
        : date
          ? date.toISOString().split("T")[0]
          : "",
  );
  const [endDate, setEndDate] = useState(
    typeof event?.endDate === "string" && event?.endDate.includes("T")
      ? event.endDate.split("T")[0]
      : typeof event?.endDate === "string"
        ? event.endDate
        : date
          ? date.toISOString().split("T")[0]
          : "",
  );
  const [startTime, setStartTime] = useState(event?.startTime || "");
  const [endTime, setEndTime] = useState(event?.endTime || "");
  const [details, setDetails] = useState(event?.details || "");
  const [repeat, setRepeat] = useState(event?.repeat || "none");
  const [reminders, setReminders] = useState(event?.reminders || []);
  const [reminderInput, setReminderInput] = useState("");
  const [customReminder, setCustomReminder] = useState("");
  const [activityType, setActivityType] = useState(
    event?.activityType || "Zoom",
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [multiDay, setMultiDay] = useState(false);

  // Auto-set endTime to 1 hour after startTime for new events
  React.useEffect(() => {
    if (mode === "add" && startTime && !endTime) {
      const [h, m] = startTime.split(":").map(Number);
      let endH = h + 1;
      let endM = m;
      if (endH >= 24) endH -= 24;
      const newEndTime = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
      setEndTime(newEndTime);
    }
  }, [mode, startTime, endTime]);

  // Center dialogs on open, but a bit higher
  const mainDialogInitial = {
    x: window.innerWidth / 2 - 200,
    y: window.innerHeight / 2 - 220,
  };
  const detailsDialogInitial = {
    x: window.innerWidth / 2 - 180,
    y: window.innerHeight / 2 - 120,
  };

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
    const [input, setInput] = useState(value ? format24hrTo12hr(value) : "");
    const [showDropdown, setShowDropdown] = useState(false);
    const [lastValid, setLastValid] = useState(
      value ? format24hrTo12hr(value) : "",
    );
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      const formatted = value ? format24hrTo12hr(value) : "";
      setInput(formatted);
      setLastValid(formatted);
    }, [value]);

    // Dropdown for whole hours only
    const hourOptions: string[] = [];
    for (let h = 0; h < 24; h++) {
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? "AM" : "PM";
      hourOptions.push(`${hour12}:00 ${ampm}`);
    }

    // Only call onChange if input is a full time with AM/PM, or on blur for h:mm
    function isFullTime(str: string) {
      // Accepts h:mm am/pm, hh:mm am/pm, h am/pm, hh am/pm
      return (
        /^(\d{1,2}):(\d{2})\s*([ap](m)?)$/i.test(str.trim()) ||
        /^(\d{1,2})\s*([ap](m)?)$/i.test(str.trim())
      );
    }
    function isHourMinute(str: string) {
      // Accepts h:mm, hh:mm (no am/pm)
      return (
        /^(\d{1,2}):(\d{2})\s*$/i.test(str.trim()) ||
        /^(\d{1,2}):(\d{2})$/i.test(str.trim())
      );
    }

    const handleDropdownSelect = (opt: string, e: React.MouseEvent) => {
      e.preventDefault(); // Prevent input blur before click
      setInput(opt);
      setLastValid(opt);
      setShowDropdown(false);
      // Do NOT call onChange here; only update visually
      setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      // Only call onChange if input is a full time with AM/PM while typing
      if (isFullTime(e.target.value)) {
        const parsed = parseTimeInput(e.target.value);
        if (parsed) {
          setLastValid(format24hrTo12hr(parsed));
          // Do NOT call onChange here; only on blur or Enter/Tab
        }
      }
      // Do NOT call onChange for h:mm (no am/pm) while typing
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        (e.key === "Enter" || e.key === "Tab") &&
        (isHourMinute(input) || isFullTime(input))
      ) {
        const parsed = parseTimeInput(input);
        if (parsed) {
          setInput(format24hrTo12hr(parsed));
          setLastValid(format24hrTo12hr(parsed));
          onChange(parsed);
        }
      }
    };

    const handleInputFocus = () => {
      setShowDropdown(true);
    };

    const handleInputBlur = () => {
      setTimeout(() => setShowDropdown(false), 150); // allow dropdown click
      if (input === "") return; // allow empty input
      // On blur, allow h:mm (no am/pm) to default to AM
      if (isHourMinute(input) || isFullTime(input)) {
        const parsed = parseTimeInput(input);
        if (parsed) {
          setInput(format24hrTo12hr(parsed));
          setLastValid(format24hrTo12hr(parsed));
          onChange(parsed); // Always call onChange on blur if valid
          return;
        }
      }
      setInput(lastValid); // revert to last valid
    };

    // +/- buttons for 15-min increments (single click only)
    const adjust = (delta: number) => {
      let parsed = parseTimeInput(input);
      if (!parsed) parsed = value;
      if (!parsed) parsed = "12:00";
      let [h, m] = parsed.split(":").map(Number);
      let total = h * 60 + m + delta;
      if (total < 0) total += 24 * 60;
      if (total >= 24 * 60) total -= 24 * 60;
      h = Math.floor(total / 60);
      m = total % 60;
      const newVal = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      const formatted = format24hrTo12hr(newVal);
      setInput(formatted);
      setLastValid(formatted);
      onChange(newVal);
    };

    return (
      <span className={styles.timeInputCombo} style={{ position: "relative" }}>
        <input
          type="text"
          className={styles.timeTextInput}
          value={input}
          onChange={handleInput}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          aria-label={label + " text input"}
          autoComplete="off"
          ref={inputRef}
        />
        {showDropdown && (
          <div
            style={{
              position: "absolute",
              top: 28,
              left: 0,
              zIndex: 10,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: 4,
              maxHeight: 180,
              overflowY: "auto",
              minWidth: 90,
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
          >
            {hourOptions.map((opt) => (
              <div
                key={opt}
                style={{
                  padding: 2,
                  cursor: "pointer",
                  userSelect: "none",
                  fontSize: "0.97em",
                  lineHeight: "1.2",
                }}
                onMouseDown={(e) => handleDropdownSelect(opt, e)}
                tabIndex={-1}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
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
              // Guard: prevent submit if startDate is missing
              if (!startDate) {
                alert("Please select a start date.");
                return;
              }
              onSubmit({
                title,
                details,
                date: startDate || "",
                endDate: endDate || "",
                startTime,
                endTime,
                activityType,
                reminders,
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
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!multiDay) setEndDate(e.target.value);
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
                  onChange={(e) => setEndDate(e.target.value)}
                />
              )}
            </div>
            {/* Start/End times with to */}
            <label htmlFor="event-start-time" className={styles.eventLabel}>
              Start Time:
            </label>
            <div className={styles.timeRow} style={{ marginBottom: 12 }}>
              <TimeInputCombo
                id="event-start-time"
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
              />
              <span className={styles.toLabel}>to</span>
              <TimeInputCombo
                id="event-end-time"
                label="End Time"
                value={endTime}
                onChange={setEndTime}
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
                setDetails(newDetails);
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
