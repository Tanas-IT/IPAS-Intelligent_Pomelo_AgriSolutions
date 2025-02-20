import { useState } from "react";

export default function useFilters<T extends Record<string, any>>(
  defaultFilters: T,
  fetchData: () => void,
) {
  const [filters, setFilters] = useState<T>(defaultFilters);

  const updateFilters = (key: keyof T, value: any) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const applyFilters = () => fetchData();

  const clearFilters = () => setFilters(defaultFilters);

  return { filters, updateFilters, applyFilters, clearFilters };
}
