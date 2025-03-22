import React, { useEffect, useState } from "react";
import style from "./DaySelector.module.scss";
import { Button } from "antd";

interface DaySelectorProps {
  onSelectDays: (days: number[]) => void;
  onSave: (days: number[], type: "weekly" | "monthly") => Promise<boolean>;
  selectedDays?: number[];
  type: "monthly" | "weekly";
}

const DaySelector: React.FC<DaySelectorProps> = ({ onSelectDays, onSave, selectedDays = [], type }) => {
  const [selected, setSelected] = useState<number[]>(selectedDays);
  const [isEditing, setIsEditing] = useState(false);
  const [initialSelectedDays, setInitialSelectedDays] = useState<number[]>(selectedDays);
  console.log("selectedDaysdfgrg", selectedDays);
  

  useEffect(() => {
    setSelected(selectedDays);
    setInitialSelectedDays(selectedDays);
  }, [selectedDays]);

  const handleCancel = () => {
    setSelected(initialSelectedDays);
    setIsEditing(false);
  };

  const handleDaySelect = (day: number) => {
    if (!isEditing) return;

    const updatedDays = selected.includes(day)
      ? selected.filter((d) => d !== day)
      : [...selected, day];

    setSelected(updatedDays);
    onSelectDays(updatedDays);
  };

  const handleSave = () => {
    onSave(selected, type).then((isSuccess) => {
      if (isSuccess) {
        setIsEditing(false);
      }
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const days = type === "weekly" 
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : [...Array(31)].map((_, index) => (index + 1).toString());

  return (
    <div className={style.daySelectorContainer}>
      <div className={style.monthGrid}>
        {days.map((day, index) => {
          const dayNumber = type === "weekly" ? (index === 6 ? 0 : index + 1) : parseInt(day);

          return (
            <span
              key={dayNumber}
              className={`${style.monthDay} ${selected.includes(dayNumber) ? style.active : ""}`}
              onClick={() => handleDaySelect(dayNumber)}
              style={{ pointerEvents: isEditing ? "auto" : "none" }}
            >
              {day}
            </span>
          );
        })}
      </div>
      {isEditing ? (
      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" onClick={handleSave} style={{ marginRight: 8 }}>
          Save
        </Button>
        <Button type="default" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    ) : (
      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
      <Button onClick={handleEdit} style={{ marginTop: 16 }}>
        Edit
      </Button>
      </div>
    )}
    </div>
  );
};

export default DaySelector;