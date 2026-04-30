import React, { useState } from "react";
import { ToolbarProps, View } from "react-big-calendar";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../customStyles.css";

const CalendarToolbar: React.FC<ToolbarProps & { onNewEvent: () => void }> = ({
  date,
  label,
  onNavigate,
  views,
  view,
  onView,
  onNewEvent,
}) => {
  const [search, setSearch] = useState("");

  // Only show supported views
  const supportedViews: View[] = ["month", "week", "day"];
  const viewNames = Array.isArray(views)
    ? views.filter((v) => supportedViews.includes(v as View))
    : supportedViews.filter((v) => views[v]);

  return (
    <div
      className="calendar-toolbar"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: 16,
      }}
    >
      {/* Left: view-switch buttons and Today button */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
        {viewNames.map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`calendar-toolbar-button${view === v ? " active" : ""}`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1).replace("_", " ")}
          </button>
        ))}
        <button
          onClick={() => onNavigate("TODAY")}
          className="calendar-toolbar-button"
        >
          Today
        </button>
      </div>
      {/* Center: nav icons and label */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => onNavigate("PREV")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            marginRight: 8,
          }}
        >
          <FaChevronLeft color="#95169eff" size={24} />
        </button>
        <span
          style={{
            fontWeight: "bold",
            fontSize: 22,
            minWidth: 120,
            textAlign: "center",
            color: "#6a0572",
          }}
        >
          {label}
        </span>
        <button
          onClick={() => onNavigate("NEXT")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            marginLeft: 8,
          }}
        >
          <FaChevronRight color="#95169eff" size={24} />
        </button>
      </div>
      {/* Right: New Event button and search bar */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 8,
        }}
      >
        <button className="calendar-toolbar-button" onClick={onNewEvent}>
          New Event
        </button>
        <input
          type="text"
          placeholder="Search activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: 4,
            borderRadius: 4,
            border: "1px solid #ccc",
            minWidth: 180,
          }}
        />
      </div>
    </div>
  );
};

export default CalendarToolbar;
