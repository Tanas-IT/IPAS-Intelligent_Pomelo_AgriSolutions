import React, { useEffect, useState } from "react";
import style from "./PlanList.module.scss";
import { Button } from "antd";

interface DaySelectorProps {
  onSelectDays: (days: number[]) => void;
  onSave: (days: number[], type: "weekly" | "monthly") => void;
  selectedDays?: number[];
  type: "monthly" | "weekly";
}

const DaySelector: React.FC<DaySelectorProps> = ({ onSelectDays, onSave, selectedDays = [], type }) => {
  const [selected, setSelected] = useState<number[]>(selectedDays);

  useEffect(() => {
    setSelected(selectedDays);
  }, [selectedDays]);

  const handleDaySelect = (day: number) => {
    const updatedDays = selected.includes(day)
      ? selected.filter((d) => d !== day)
      : [...selected, day];

    setSelected(updatedDays);
    onSelectDays(updatedDays);
  };

  const handleSave = () => {
    onSave(selected, type);
  };

  const days = type === "weekly" 
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : [...Array(31)].map((_, index) => (index).toString());

  return (
    <div>
      <div className={style.monthGrid}>
        {days.map((day, index) => {
          const dayNumber = type === "weekly" ? (index === 6 ? 0 : index + 1) : parseInt(day);

          return (
            <span
              key={dayNumber}
              className={`${style.monthDay} ${selected.includes(dayNumber) ? style.active : ""}`}
              onClick={() => handleDaySelect(dayNumber)}
            >
              {day}
            </span>
          );
        })}
      </div>
      <Button type="primary" onClick={handleSave} style={{ marginTop: 16 }}>
        Save
      </Button>
    </div>
  );
};

export default DaySelector;