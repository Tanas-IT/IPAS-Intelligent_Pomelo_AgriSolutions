import { useCallback } from "react";

function useHasChanges<T extends Record<string | number, any>>(data: T[]) {
  return useCallback(
    (newData: T, keyField: keyof T): boolean => {
      const oldData = data.find((item) => item[keyField] === newData[keyField]);
      if (!oldData) return false;

      return Object.keys(newData).some((key) => {
        const typedKey = key as keyof T;
        return oldData[typedKey] !== newData[typedKey];
      });
    },
    [data],
  );
}

export default useHasChanges;
