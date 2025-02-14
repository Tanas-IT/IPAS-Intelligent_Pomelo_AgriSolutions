import { useNavigate } from "react-router-dom"
import style from "./Worklog.module.scss"

type props = {
    calendarEvent: {
      id: string | number
      title: string
      start: string
      end: string
    }
  }
  
  export default function CustomTimeGridEvent({ calendarEvent }: props) {
    const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/hr-management/worklogs/${calendarEvent.id}`);
  };
    return (
      <div
      onClick={handleClick}
      className={style.event}
    >
      <strong>{calendarEvent.title}</strong>
      <p>{calendarEvent.start} - {calendarEvent.end}</p>
    </div>
    )
  }