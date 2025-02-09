import React, { useEffect, useState } from "react";
import style from "./PlanList.module.scss";

interface DaySelectorProps {
  onSelectDays: (days: number[]) => void;
  selectedDays?: number[];
  type: "monthly" | "weekly";
}

const DaySelector: React.FC<DaySelectorProps> = ({ onSelectDays, selectedDays = [], type }) => {
  const [selected, setSelected] = useState<number[]>(selectedDays);

  useEffect(() => {
    setSelected(selectedDays);
    console.log(selectedDays);
    
  }, [selectedDays]);

  const handleDaySelect = (day: number) => {
    const updatedDays = selected.includes(day)
      ? selected.filter((d) => d !== day)
      : [...selected, day];

    setSelected(updatedDays);
    onSelectDays(updatedDays);
  };

  const days = type === "weekly" 
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : [...Array(31)].map((_, index) => (index + 1).toString());

  return (
    <div className={style.monthGrid}>
      {days.map((day, index) => {
                const dayNumber = type === "weekly" ? index + 1 : parseInt(day);
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
  );
};

export default DaySelector;
