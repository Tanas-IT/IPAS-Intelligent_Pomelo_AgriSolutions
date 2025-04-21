import { FILE_FORMAT, UserRole } from "@/constants";
import { DecodedToken, FileResource } from "@/types";
import { format } from "date-fns";
import { jwtDecode } from "jwt-decode";
import moment from "moment";

export const formatDate = (date: Date | string): string => {
  return format(new Date(date), "dd/MM/yyyy");
};

export const formatDateAndTime = (date: Date | string): string => {
  return format(new Date(date), "dd/MM/yyyy hh:mm a");
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
  hex = hex.replace("#", "");

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
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

export const generateYearOptions = (
  startYear: number = 2020,
  range: number = 7,
  includeAll: boolean = false
): { value: number | string; label: string }[] => {
  const currentYear = new Date().getFullYear();
  const endYear = currentYear + range;

  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => {
    const year = startYear + i;
    return { value: year, label: String(year) };
  });

  if (includeAll) {
    return [{ value: "all", label: "All" }, ...years];
  }

  return years;
};

export const getFileFormat = (
  mimeType: string
): (typeof FILE_FORMAT)[keyof typeof FILE_FORMAT] | null => {
  if (!mimeType) return null;
  if (mimeType.startsWith("image/")) return FILE_FORMAT.IMAGE;
  if (mimeType.startsWith("video/")) return FILE_FORMAT.VIDEO;
  return null;
};

export const processResourcesToImages = (resources?: FileResource[]) => {
  if (!resources || resources.length === 0) return [];

  const images = resources
    .filter((res) => {
      const format = res.fileFormat.toLowerCase();
      const url = res.resourceURL.toLowerCase();
      return (
        ["jpeg", "jpg", "png", "gif"].includes(format) ||
        (format === "image" && /\.(jpg|jpeg|png|gif)$/i.test(url))
      );
    })
    .map((res, index) => {
      const format = res.fileFormat.toLowerCase();
      return {
        id: res.resourceID,
        uri: res.resourceURL,
        type:
          format === "png"
            ? "image/png"
            : format === "gif"
            ? "image/gif"
            : format === "image" &&
              res.resourceURL.toLowerCase().endsWith(".png")
            ? "image/png"
            : format === "image" &&
              res.resourceURL.toLowerCase().endsWith(".gif")
            ? "image/gif"
            : "image/jpeg",
        name:
          res.resourceURL.split("/").pop() ||
          `image_${index + 1}.${format === "image" ? "jpg" : format}`,
      };
    });

  return images;
};

export const processResourcesToVideos = (resources?: FileResource[]) => {
  if (!resources || resources.length === 0) return [];

  const videos = resources
    .filter((res) => {
      const format = res.fileFormat.toLowerCase();
      const url = res.resourceURL.toLowerCase();
      return (
        ["mp4", "mov", "avi", "mkv"].includes(format) ||
        (format === "video" && /\.(mp4|mov|avi|mkv)$/i.test(url))
      );
    })
    .map((res, index) => {
      const format = res.fileFormat.toLowerCase();
      return {
        id: res.resourceID,
        uri: res.resourceURL,
        type:
          format === "mov"
            ? "video/quicktime"
            : format === "avi"
            ? "video/x-msvideo"
            : format === "mkv"
            ? "video/x-matroska"
            : "video/mp4",
        name:
          res.resourceURL.split("/").pop() ||
          `video_${index + 1}.${format === "video" ? "mp4" : format}`,
      };
    });

  return videos;
};
