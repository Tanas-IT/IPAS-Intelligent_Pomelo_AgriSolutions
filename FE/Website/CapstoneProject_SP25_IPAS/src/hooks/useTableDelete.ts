import { DEFAULT_ROWS_PER_PAGE } from "@/constants";
import { ApiResponse } from "@/payloads";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

interface DeleteParams {
  (id: number | string, ...args: any[]): Promise<ApiResponse<Object>>;
}

interface PaginationParams {
  currentPage?: number;
  rowsPerPage?: number;
  totalRecords: number;
  handlePageChange: (page: number) => void;
}

interface UseDeleteProps {
  deleteFunction: DeleteParams;
  fetchData: () => Promise<void>;
  onSuccess?: () => void;
}

export default function useDelete(
  { deleteFunction, fetchData, onSuccess }: UseDeleteProps,
  {
    currentPage = 1,
    rowsPerPage = DEFAULT_ROWS_PER_PAGE,
    totalRecords,
    handlePageChange,
  }: PaginationParams,
) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = useCallback(
    async (id?: number | string, ...args: any[]) => {
      if (!id) return;

      try {
        setIsLoading(true);
        const result = await deleteFunction(id, ...args);
        if (result.statusCode === 200) {
          if ((totalRecords - 1) % rowsPerPage === 0 && currentPage > 1) {
            handlePageChange(currentPage - 1);
          } else {
            await fetchData();
          }
          toast.success(result.message);
          onSuccess?.();
        } else {
          toast.error(result.message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [deleteFunction, fetchData],
  );

  return {
    handleDelete,
  };
}
