import { useNavigate } from "react-router-dom";
import style from "./Worklog.module.scss";
import { useState } from "react";
import { Flex } from "antd";

type Props = {
  calendarEvent: {
    id: string | number;
    title: string;
    start: string;
    end: string;
    calendarId: string;
  };
};

export default function CustomDateGridEvent({ calendarEvent }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/hr-management/worklogs/${calendarEvent.id}`);
  };

  const calendarId = calendarEvent.calendarId;

  return (
    <div
      onClick={handleClick}
      className={`${style.event} ${style[`event${calendarId}`] || ""}`}
      style={{ cursor: "pointer" }}
    >
      <Flex gap={10}>
        <p style={{ fontSize: "13px" }}>{calendarEvent.start.split(" ")[1]}</p>
        <p style={{ fontSize: "13px" }}>{calendarEvent.title}</p>
      </Flex>
    </div>
  );
}
