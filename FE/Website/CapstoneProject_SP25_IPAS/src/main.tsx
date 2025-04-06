import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "aos/dist/aos.css";
import App from "./App.tsx";

const originalWarn = console.warn;
const originalError = console.error;

// Ghi đè console.warn
console.warn = (message, ...args) => {
  if (typeof message === "string" && message.includes("antd")) {
    return; // Bỏ qua tất cả các cảnh báo có liên quan đến Ant Design
  }
};

// Ghi đè console.error
console.error = (message, ...args) => {
  if (typeof message === "string" && message.includes("antd")) {
    return; // Bỏ qua tất cả các lỗi có liên quan đến Ant Design
  }
};

createRoot(document.getElementById("root")!).render(<App />);
