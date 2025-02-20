import { ApiResponse } from "@/payloads";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

interface UseHandleAddProps<T> {
  addService: (data: T) => Promise<ApiResponse<Object>>;
  fetchData: () => Promise<void>;
  onSuccess?: () => void;
}

export default function useTableAdd<T>({ addService, fetchData, onSuccess }: UseHandleAddProps<T>) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = useCallback(
    async (data: T) => {
      if (!data) return;
      setIsLoading(true);
      try {
        const result = await addService(data);
        if (result.statusCode === 200) {
          toast.success(result.message);
          await fetchData();
          onSuccess?.();
        } else {
          toast.error(result.message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [addService, fetchData, onSuccess],
  );

  return { handleAdd, isLoading };
}
