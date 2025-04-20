import { GetData } from "@/payloads";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

interface useFetchDataProps<T> {
  fetchFunction: (
    page?: number,
    limit?: number,
    sortField?: string,
    sortDirection?: string,
    searchValue?: string,
    additionalParams?: Record<string, any>,
  ) => Promise<GetData<T>>;
  additionalParams?: Record<string, any>;
}

function useFetchData<T>({ fetchFunction, additionalParams = {} }: useFetchDataProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [currentPage, setCurrentPage] = useState<number | undefined>();
  const [rowsPerPage, setRowsPerPage] = useState<number | undefined>();

  const [sortField, setSortField] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<string | undefined>();

  const [searchValue, setSearchValue] = useState<string>("");

  const [rotation, setRotation] = useState<number>(360);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchData = useCallback(
    async (currentPageReset?: number) => {
      if (currentPageReset && currentPageReset !== currentPage) {
        setCurrentPage(currentPageReset);
        return;
      }

      setIsLoading(true);

      setTimeout(async () => {
        try {
          const result = await fetchFunction(
            currentPage,
            rowsPerPage,
            sortField,
            sortDirection,
            searchValue,
            additionalParams,
          );
          if (result && Array.isArray(result.list)) {
            setData(result.list);
            setTotalPages(result.totalPage);
            setTotalRecords(result.totalRecord);
          } else {
            setData([]);
            setTotalPages(0);
            setTotalRecords(0);
          }
        } finally {
          setIsLoading(false);
        }
      }, 500);
    },
    [
      currentPage,
      rowsPerPage,
      searchValue,
      sortField,
      sortDirection,
      fetchFunction,
      additionalParams,
    ],
  );

  // Lấy tham số từ URL khi trang được tải
  useEffect(() => {
    const page = searchParams.get("page");
    const rowsPerPage = searchParams.get("limit");
    const sortField = searchParams.get("sf");
    const sortDirection = searchParams.get("sd");
    const search = searchParams.get("s");

    setCurrentPage(page ? Number(page) : undefined);
    if (rowsPerPage) setRowsPerPage(Number(rowsPerPage));
    if (sortField) setSortField(sortField);
    if (sortDirection) setSortDirection(sortDirection as "asc" | "desc");
    if (search) setSearchValue(search);

    setIsFirstLoad(false);
  }, [searchParams]);

  // Cập nhật URL khi có thay đổi
  useEffect(() => {
    if (isFirstLoad) return;
    const params = new URLSearchParams();

    if (currentPage !== undefined) params.set("page", String(currentPage));
    if (rowsPerPage !== undefined) params.set("limit", String(rowsPerPage));
    if (sortField !== undefined) {
      params.set("sf", sortField);
      params.set("sd", sortDirection || "");
    }
    if (searchValue) params.set("s", searchValue);

    setSearchParams(params);
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue, setSearchParams]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setCurrentPage(1);
    setRowsPerPage(newRowsPerPage);
  }, []);

  const handleSortChange = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDirection((prevDirection) => (prevDirection === "asc" ? "desc" : "asc"));
        setRotation((prevRotation) => (prevRotation === 180 ? 360 : 180));
      } else {
        setSortField(field);
        setSortDirection("asc");
        setRotation(360);
      }
    },
    [sortField, sortDirection, fetchData],
  );

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  }, []);

  return {
    data,
    fetchData,
    totalRecords,
    totalPages,
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    rotation,
    searchValue,
    handlePageChange,
    handleRowsPerPageChange,
    handleSortChange,
    handleSearch,
    isLoading,
  };
}

export default useFetchData;

// try {
//   setIsLoading(true);
//   const loadData = async () => {
//     const result = await fetchFunction(
//       currentPage,
//       rowsPerPage,
//       sortField,
//       sortDirection,
//       searchValue,
//       additionalParams,
//     );
//     setData(result.list);
//     setTotalPages(result.totalPage);
//     setTotalRecords(result.totalRecord);
//     setIsLoading(false);
//     // if (isInitialLoad) {
//     //   setIsInitialLoad(false);
//     // }
//   };
//   if (isInitialLoad || isLoading) {
//     setTimeout(async () => {
//       await loadData();
//     }, 500);
//     // } else {
//     // await loadData();
//   }
// } catch (error) {
//   toast.error("Error fetching data");
//   setIsLoading(false);
// } finally {

// }
