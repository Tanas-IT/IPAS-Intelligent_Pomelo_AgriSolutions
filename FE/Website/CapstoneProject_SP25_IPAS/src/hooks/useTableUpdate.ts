import { ApiResponse } from "@/payloads";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

interface UseHandleUpdateProps<T> {
  updateService: (data: T, ...args: any[]) => Promise<ApiResponse<Object>>;
  fetchData: () => Promise<void>;
  onSuccess?: () => void;
  onError?: () => void;
}

export default function useTableUpdate<T>({
  updateService,
  fetchData,
  onSuccess,
  onError,
}: UseHandleUpdateProps<T>) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = useCallback(
    async (data?: T, ...args: any[]) => {
      if (!data) return;
      setIsUpdating(true);
      try {
        const result = await updateService(data, ...args);
        if (result.statusCode === 200) {
          toast.success(result.message);
          await fetchData();
          onSuccess?.();
        } else {
          toast.error(result.message);
          onError?.();
        }
      } finally {
        setIsUpdating(false);
      }
    },
    [updateService, fetchData],
  );

  return { handleUpdate, isUpdating };
}
