import { format } from "date-fns";

export const formatDate = (date: Date | string): string => {
  return format(new Date(date), "dd/MM/yyyy");
};

export const formatTime = (time: string) => {
  const [startTime, endTime] = time.split(" - ");

  const convertTo12Hour = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hourInt = parseInt(hours, 10);
    const period = hourInt >= 12 ? "PM" : "AM";
    const formattedHour = hourInt % 12 || 12;

    return `${formattedHour} ${period}`;
  };

  return `${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`;
};

