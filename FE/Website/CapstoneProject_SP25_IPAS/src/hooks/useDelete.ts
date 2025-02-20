import { DEFAULT_ROWS_PER_PAGE } from "@/constants";
import { ApiResponse } from "@/payloads";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

interface DeleteParams<T> {
  (id: number, ...args: any[]): Promise<ApiResponse<Object>>;
}

interface DeleteConfirmModal<T> {
  modalState: { data?: T };
  hideModal: () => void;
}

interface PaginationParams {
  currentPage?: number;
  rowsPerPage?: number;
  totalRecords: number;
  handlePageChange: (page: number) => void;
}

export default function useDelete<T extends { id: number }>(
  deleteFunction: DeleteParams<T>,
  fetchData: () => Promise<void>,
  deleteConfirmModal: DeleteConfirmModal<T>,
  {
    currentPage = 1,
    rowsPerPage = DEFAULT_ROWS_PER_PAGE,
    totalRecords,
    handlePageChange,
  }: PaginationParams,
) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = useCallback(
    async (id: number, ...args: any[]) => {
      const item = deleteConfirmModal.modalState.data;
      if (!item?.id) return;
      console.log(item);

      // try {
      // setIsLoading(true);
      //   const result = await deleteFunction(id, ...args);
      //   if (result.statusCode === 200) {
      //     if ((totalRecords - 1) % rowsPerPage === 0 && currentPage > 1) {
      //       handlePageChange(currentPage - 1);
      //     } else {
      //       fetchData();
      //     }
      //     toast.success("Xoá thành công");
      //   } else {
      //     toast.success(result.message);
      //   }
      // } catch (error) {
      //   toast.error("Xoá thất bại");
      // }
    },
    [deleteFunction, fetchData],
  );

  return {
    handleDelete,
  };
}
