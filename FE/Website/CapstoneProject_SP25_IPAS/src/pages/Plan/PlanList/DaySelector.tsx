// import React, { useEffect, useState } from "react";
// import style from "./PlanList.module.scss";
// import { Button } from "antd";

// interface DaySelectorProps {
//   onSelectDays: (days: number[]) => void;
//   onSave: (days: number[], type: "weekly" | "monthly") => void;
//   selectedDays?: number[];
//   type: "monthly" | "weekly";
// }

// const DaySelector: React.FC<DaySelectorProps> = ({ onSelectDays, onSave, selectedDays = [], type }) => {
//   const [selected, setSelected] = useState<number[]>(selectedDays);

//   useEffect(() => {
//     setSelected(selectedDays);
//   }, [selectedDays]);

//   const handleDaySelect = (day: number) => {
//     const updatedDays = selected.includes(day)
//       ? selected.filter((d) => d !== day)
//       : [...selected, day];

//     setSelected(updatedDays);
//     onSelectDays(updatedDays);
//   };

//   const handleSave = () => {
//     onSave(selected, type);
//   };

//   const days = type === "weekly" 
//         ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
//         : [...Array(31)].map((_, index) => (index + 1).toString());

//   return (
//     <div>
//       <div className={style.monthGrid}>
//         {days.map((day, index) => {
//           const dayNumber = type === "weekly" ? (index === 6 ? 0 : index + 1) : parseInt(day);

//           return (
//             <span
//               key={dayNumber}
//               className={`${style.monthDay} ${selected.includes(dayNumber) ? style.active : ""}`}
//               onClick={() => handleDaySelect(dayNumber)}
//             >
//               {day}
//             </span>
//           );
//         })}
//       </div>
//       <Button type="primary" onClick={handleSave} style={{ marginTop: 16 }}>
//         Save
//       </Button>
//     </div>
//   );
// };

// export default DaySelector;
import React, { useEffect, useState } from "react";
import style from "./PlanList.module.scss";
import { Button } from "antd";

interface DaySelectorProps {
  onSelectDays: (days: number[]) => void;
  onSave: (days: number[], type: "weekly" | "monthly") => Promise<boolean>;
  selectedDays?: number[];
  type: "monthly" | "weekly";
}

const DaySelector: React.FC<DaySelectorProps> = ({ onSelectDays, onSave, selectedDays = [], type }) => {
  const [selected, setSelected] = useState<number[]>(selectedDays);
  const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa
  const [initialSelectedDays, setInitialSelectedDays] = useState<number[]>(selectedDays);
  console.log("selectedDaysdfgrg", selectedDays);
  

  useEffect(() => {
    setSelected(selectedDays);
    setInitialSelectedDays(selectedDays); // Cập nhật giá trị ban đầu khi selectedDays thay đổi
  }, [selectedDays]);

  const handleCancel = () => {
    setSelected(initialSelectedDays); // Khôi phục lại giá trị ban đầu
    setIsEditing(false); // Thoát khỏi chế độ chỉnh sửa
  };

  const handleDaySelect = (day: number) => {
    if (!isEditing) return; // Chỉ cho phép chọn ngày khi đang ở chế độ chỉnh sửa

    const updatedDays = selected.includes(day)
      ? selected.filter((d) => d !== day)
      : [...selected, day];

    setSelected(updatedDays);
    onSelectDays(updatedDays);
  };

  const handleSave = () => {
    onSave(selected, type).then((isSuccess) => {
      if (isSuccess) {
        setIsEditing(false); // Chỉ thoát khỏi chế độ chỉnh sửa nếu lưu thành công
      }
    });
  };

  const handleEdit = () => {
    setIsEditing(true); // Vào chế độ chỉnh sửa
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