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

export const darkenColor = (hex: string, amount = 80): string => {
  hex = hex.replace('#', '');

  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  const num = parseInt(hex, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
