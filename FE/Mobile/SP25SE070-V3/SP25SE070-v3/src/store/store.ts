import { GetPlantDetail } from "@/payloads";
import { create } from "zustand";

interface PlantStore {
  plantId: number | null;
  setPlantId: (plantId: number | null) => void;
  plant: GetPlantDetail | null;
  setPlant: (plant: GetPlantDetail | null) => void;
  shouldRefetch: boolean;
  markForRefetch: () => void;
  isGrowthDetailView: boolean;
  setIsGrowthDetailView: (value: boolean) => void;
}

export const usePlantStore = create<PlantStore>((set, get) => ({
  plantId: null,
  setPlantId: (plantId) => set({ plantId }),
  plant: null,
  setPlant: (plant) => set({ plant }),
  shouldRefetch: false,
  markForRefetch: () => set({ shouldRefetch: !get().shouldRefetch }),
  isGrowthDetailView: false,
  setIsGrowthDetailView: (value) => set({ isGrowthDetailView: value }),
}));
