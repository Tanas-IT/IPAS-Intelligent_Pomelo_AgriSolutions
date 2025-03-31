import { useNavigate } from "react-router-dom";
import style from "./Worklog.module.scss";
import { useState } from "react";

type props = {
  calendarEvent: {
    id: string | number;
    title: string;
    start: string;
    end: string;
    calendarId: string;
  };
};

export default function CustomTimeGridEvent({ calendarEvent }: props) {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState<boolean>(false);

  const handleClick = () => {
    navigate(`/hr-management/worklogs/${calendarEvent.id}`);
  };
  const calendarId = calendarEvent.calendarId;

  return (
    <div onClick={handleClick} className={`${style.event} ${style[`event${calendarId}`] || ""}`}>
      <strong>{calendarEvent.title}</strong>
      <p>
        {calendarEvent.start.split(" ")[1]} - {calendarEvent.end.split(" ")[1]}
      </p>
    </div>
  );
}
