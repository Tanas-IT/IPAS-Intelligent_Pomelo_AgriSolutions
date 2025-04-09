import { UserRole } from "@/constants";
import { DecodedToken } from "@/types";
import { format } from "date-fns";
import { jwtDecode } from "jwt-decode";
import moment from "moment";

export const formatDate = (date: Date | string): string => {
  return format(new Date(date), "dd/MM/yyyy");
};

export const formatDayMonth = (date: Date | string): string => {
  return moment(date).format("dddd, Do MMMM YYYY");
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

export const getRoleId = (accessToken: string): string => {
  if (!accessToken) return "";
  const decoded = jwtDecode<DecodedToken>(accessToken);
  const roleId = decoded.roleId;
  return roleId;
};

export const getUserId = (accessToken: string): string => {
  if (!accessToken) return "";
  return jwtDecode<DecodedToken>(accessToken).UserId;
};

export const getRoleName = (roleId: number): string => {
  if (roleId === UserRole.Admin) {
    return "Administrator";
  } else if (roleId === UserRole.User) {
    return "User";
  } else if (roleId === UserRole.Owner) {
    return "Farm Owner";
  } else if (roleId === UserRole.Manager) {
    return "Farm Manager";
  } else if (roleId === UserRole.Employee) {
    return "Farm Employee";
  }
  return UserRole[roleId] ? `Role: ${UserRole[roleId]}` : "undefined";
};
