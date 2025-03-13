import { useState } from "react";
import { criteriaService } from "@/services";
import { MESSAGES } from "@/constants";
import { toast } from "react-toastify";
import { GetCriteria } from "@/payloads";

export const useCriteriaManagement = () => {
  const [dataSource, setDataSource] = useState<(GetCriteria & { key: number; index: number })[]>(
    [],
  );
  const handleCriteriaChange = async (value: string) => {
    if (!value) return;
    const res = await criteriaService.getCriteriaByMasterType(Number(value));

    if (res.statusCode === 200) {
      const criteriaList: GetCriteria[] = res.data?.criterias || [];
      const formattedCriteria = criteriaList.map((criteria, index) => ({
        ...criteria,
        key: index + 1, // Key phải là unique
        index: index + 1, // Dùng để hiển thị số thứ tự
        priority: index + 1, // Mặc định đặt priority theo thứ tự
      }));
      setDataSource(formattedCriteria);
    }
  };

  const handleDelete = (key: number) => {
    const updatedData = dataSource.filter((item) => item.key !== key);
    setDataSource(
      updatedData.map((item, index) => ({ ...item, priority: index + 1, index: index + 1 })),
    );
  };

  const handlePriorityChange = (key: number, value: number | null) => {
    setDataSource((prev) =>
      prev.map((item) => (item.key === key ? { ...item, priority: value ?? 1 } : item)),
    );
  };

  const isCriteriaListValid = () => {
    if (dataSource.length === 0) {
      toast.error(MESSAGES.REQUIRED_VALUE);
      return false;
    }

    const priorities = dataSource.map((item) => item.priority);
    const uniquePriorities = [...new Set(priorities)];

    if (priorities.length !== uniquePriorities.length) {
      toast.error(MESSAGES.PRIORITY_UNIQUE);
      return false;
    }

    uniquePriorities.sort((a, b) => a - b);
    const expectedPriorities = Array.from({ length: uniquePriorities.length }, (_, i) => i + 1);

    if (JSON.stringify(uniquePriorities) !== JSON.stringify(expectedPriorities)) {
      toast.error(MESSAGES.PRIORITY_SEQUENTIAL);
      return false;
    }

    return true;
  };

  return {
    dataSource,
    setDataSource,
    handleCriteriaChange,
    handleDelete,
    handlePriorityChange,
    isCriteriaListValid,
  };
};
