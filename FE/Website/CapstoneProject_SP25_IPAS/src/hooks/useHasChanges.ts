import { GROWTH_ACTIONS, growthStageFormFields } from "@/constants";
import { useCallback } from "react";

function useHasChanges<T extends Record<string | number, any>>(data: T[]) {
  return useCallback(
    (
      newData: T,
      keyField?: keyof T,
      defaultValues?: Partial<T>,
      ignoredKeys?: (keyof T)[],
    ): boolean => {
      if (keyField) {
        // Xử lý cho update
        const oldData = data.find((item) => item[keyField] === newData[keyField]);

        if (!oldData) return false;
        console.log(oldData);
        console.log(newData);

        return Object.keys(newData).some((key) => {
          const typedKey = key as keyof T;
          if (ignoredKeys?.includes(typedKey)) return false;

          if (!(typedKey in oldData) && !(typedKey in newData)) return false;
          if (
            !(typedKey in oldData) &&
            typedKey in newData &&
            newData[typedKey] != null &&
            newData[typedKey] != undefined &&
            newData[typedKey] !== ""
          ) {
            return true;
          }
          const oldValue = oldData[typedKey];
          const newValue = newData[typedKey];

          if (Array.isArray(oldValue) || Array.isArray(newValue)) {
            return false;
          }
          if (typeof oldValue === "object" && typeof newValue === "object") {
            return JSON.stringify(oldValue) !== JSON.stringify(newValue);
          }

          if (typedKey === growthStageFormFields.activeFunction && newValue) {
            const normalize = (val: string) =>
              val
                .split(",")
                .map((s) => s.trim())
                .sort()
                .join(",");

            // Nếu newValue là "Both", đổi thành "Grafted,Harvest" để so sánh
            const formattedNewValue =
              newValue === "Both"
                ? `${GROWTH_ACTIONS.GRAFTED},${GROWTH_ACTIONS.HARVEST}`
                : newValue;

            return normalize(oldValue) !== normalize(formattedNewValue);
          }

          // Nếu là string thì trim trước khi so sánh
          if (
            typeof oldValue === "string" &&
            typeof newValue === "string" &&
            oldValue.includes("T") && // Kiểm tra nếu có T00:00:00
            newValue.length === 10 // Kiểm tra nếu chỉ có YYYY-MM-DD
          ) {
            return oldValue.substring(0, 10) !== newValue; // So sánh chỉ phần YYYY-MM-DD
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
        // Xử lý cho add với defaultValues
        return Object.keys(newData).some((key) => {
          const typedKey = key as keyof T;

          const defaultValue = defaultValues?.[typedKey];
          const newValue = newData[typedKey];

          if (Array.isArray(newValue)) {
            return false;
          }

          // Nếu không có giá trị mặc định thì kiểm tra nếu newValue có dữ liệu
          if (defaultValue === undefined) {
            return (
              newValue !== null &&
              newValue !== undefined &&
              newValue !== "" &&
              !Number.isNaN(newValue) &&
              (!Array.isArray(newValue) || newValue.length > 0)
            );
          }

          if (typeof newValue === "object" && newValue !== null) {
            return JSON.stringify(defaultValue) !== JSON.stringify(newValue);
          }

          // Nếu là string thì trim trước khi so sánh
          if (typeof defaultValue === "string" && typeof newValue === "string") {
            return defaultValue.trim() !== newValue.trim();
          }

          // So sánh thông thường hoặc nếu defaultValue không có
          return String(defaultValue).trim() !== String(newValue).trim();
        });
      }
    },
    [data],
  );
}

export default useHasChanges;
