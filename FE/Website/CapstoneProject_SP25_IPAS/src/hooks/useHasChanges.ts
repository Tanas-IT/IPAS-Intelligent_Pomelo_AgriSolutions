import { useCallback } from "react";

function useHasChanges<T extends Record<string | number, any>>(data: T[]) {
  return useCallback(
    (newData: T, keyField?: keyof T): boolean => {
      if (keyField) {
        // Xử lý cho update
        const oldData = data.find((item) => item[keyField] === newData[keyField]);
        if (!oldData) return false;

        return Object.keys(newData).some((key) => {
          const typedKey = key as keyof T;
          const oldValue = oldData[typedKey];
          const newValue = newData[typedKey];

          // Nếu là string thì trim trước khi so sánh
          if (typeof oldValue === "string" && typeof newValue === "string") {
            return oldValue.trim() !== newValue.trim();
          }

          // Nếu oldValue không có giá trị mà newValue có
          if (
            (oldValue === null || oldValue === undefined || oldValue === "") &&
            newValue !== null &&
            newValue !== undefined &&
            newValue !== ""
          ) {
            return true;
          }

          // So sánh thông thường cho các kiểu dữ liệu khác
          return oldValue !== newValue;
        });
      } else {
        // Xử lý cho add
        return Object.keys(newData).some((key) => {
          const value = newData[key as keyof T];
          return value !== null && value !== undefined && value !== ""; // Nếu có dữ liệu → có thay đổi
        });
      }
    },
    [data],
  );
}

export default useHasChanges;
