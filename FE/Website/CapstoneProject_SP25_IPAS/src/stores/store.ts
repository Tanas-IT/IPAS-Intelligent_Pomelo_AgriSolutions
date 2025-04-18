import { LOCAL_STORAGE_KEYS } from "@/constants";
import {
  GetCropDetail,
  GetGraftedPlantDetail,
  GetHarvestDay,
  GetPlantDetail,
  GetPlantLotDetail,
} from "@/payloads";
import { PolygonInit } from "@/types";
import { create } from "zustand";

interface SidebarState {
  isExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarState: (state: boolean) => void;
}

// Tạo store Zustand
export const useSidebarStore = create<SidebarState>((set) => ({
  isExpanded: true, // Giá trị mặc định của state
  toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setSidebarState: (state) => set({ isExpanded: state }), // Cập nhật trạng thái của sidebar
}));

interface UserState {
  fullName: string;
  avatar: string;
  setUserInfo: (fullName: string, avatar: string) => void;
  clearUserInfo: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  fullName: localStorage.getItem(LOCAL_STORAGE_KEYS.FULL_NAME) || "",
  avatar: localStorage.getItem(LOCAL_STORAGE_KEYS.AVATAR) || "",

  setUserInfo: (fullName, avatar) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FULL_NAME, fullName);
    localStorage.setItem(LOCAL_STORAGE_KEYS.AVATAR, avatar);
    set({ fullName, avatar });
  },

  clearUserInfo: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.FULL_NAME);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AVATAR);
    set({ fullName: "", avatar: "" });
  },
}));

interface FarmState {
  farmName: string;
  farmLogo: string;
  farmExpiredDate: string;
  isFarmExpired: boolean;
  setFarmInfo: (name: string, logo: string, expiredDate?: string) => void;
  // checkFarmExpiration: () => void;
}

export const useFarmStore = create<FarmState>((set) => {
  const storedExpiredDate = localStorage.getItem(LOCAL_STORAGE_KEYS.FARM_EXPIRED_DATE) || "";
  const isExpired = storedExpiredDate ? new Date(storedExpiredDate) < new Date() : false;

  return {
    farmName: localStorage.getItem(LOCAL_STORAGE_KEYS.FARM_NAME) || "",
    farmLogo: localStorage.getItem(LOCAL_STORAGE_KEYS.FARM_LOGO) || "",
    farmExpiredDate: storedExpiredDate,
    isFarmExpired: isExpired,

    setFarmInfo: (name, logo, expiredDate) => {
      if (name) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.FARM_NAME, name);
        set({ farmName: name });
      }
      if (logo) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.FARM_LOGO, logo);
        set({ farmLogo: logo });
      }
      if (expiredDate) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.FARM_EXPIRED_DATE, expiredDate);
        set({
          farmExpiredDate: expiredDate,
          isFarmExpired: new Date(expiredDate) < new Date(),
        });
      }
    },
  };
});

interface LoadingState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

interface DirtyState {
  isDirty: boolean;
  setIsDirty: (value: boolean) => void;
}

export const useDirtyStore = create<DirtyState>((set) => ({
  isDirty: false,
  setIsDirty: (isDirty) => set({ isDirty }),
}));

interface MapState {
  isDirty: boolean;
  setIsDirty: (value: boolean) => void;
  isPolygonDirty: boolean; // Kiểm tra polygon thay đổi
  setIsPolygonDirty: (value: boolean) => void;
  mapRef: mapboxgl.Map | null;
  drawRef: MapboxDraw | null;
  setMapRef: (map: mapboxgl.Map | null) => void;
  setDrawRef: (draw: MapboxDraw | null) => void;
  isOverlapping: boolean;
  setIsOverlapping: (value: boolean) => void;
  currentPolygon: PolygonInit | null;
  setCurrentPolygon: (polygon: PolygonInit | null) => void;
  isPolygonReady: boolean;
  setPolygonReady: (ready: boolean) => void;
  area: number;
  width: number;
  length: number;
  setPolygonDimensions: (area: number, width: number, length: number) => void;
  startDrawingPolygon: () => void;
  clearPolygons: () => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  isDirty: false,
  setIsDirty: (value) => set({ isDirty: value }),
  isPolygonDirty: false,
  setIsPolygonDirty: (value) => set({ isPolygonDirty: value }),
  mapRef: null,
  drawRef: null,
  setMapRef: (map) => set({ mapRef: map }),
  setDrawRef: (draw) => set({ drawRef: draw }),
  isOverlapping: false,
  setIsOverlapping: (value) => set({ isOverlapping: value }),
  currentPolygon: null,
  setCurrentPolygon: (polygon) => set({ currentPolygon: polygon }),
  isPolygonReady: false,
  setPolygonReady: (ready) => set({ isPolygonReady: ready }),
  area: 0,
  width: 0,
  length: 0,
  setPolygonDimensions: (area, width, length) => set({ area, width, length }),
  startDrawingPolygon: () => {
    const draw = get().drawRef;
    if (draw) {
      draw.changeMode("draw_polygon");
    }
  },
  clearPolygons: () => {
    const draw = get().drawRef;
    if (draw) draw.deleteAll();
  },
}));

interface GrowthStageStore {
  maxAgeStart: number | null;
  setMaxAgeStart: (value: number) => void;
}

export const useGrowthStageStore = create<GrowthStageStore>((set) => ({
  maxAgeStart: null,
  setMaxAgeStart: (value) => set({ maxAgeStart: value }),
}));

interface PlantLotStore {
  lot: GetPlantLotDetail | null;
  setLot: (lot: GetPlantLotDetail | null) => void;
  shouldRefetch: boolean;
  markForRefetch: () => void;
}

export const usePlantLotStore = create<PlantLotStore>((set, get) => ({
  lot: null,
  setLot: (lot) => set({ lot }),
  shouldRefetch: false,
  markForRefetch: () => set({ shouldRefetch: !get().shouldRefetch }),
}));

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

interface GraftedPlantStore {
  graftedPlant: GetGraftedPlantDetail | null;
  setGraftedPlant: (graftedPlant: GetGraftedPlantDetail | null) => void;
  shouldRefetch: boolean;
  markForRefetch: () => void;
  isGrowthDetailView: boolean;
  setIsGrowthDetailView: (value: boolean) => void;
}

export const useGraftedPlantStore = create<GraftedPlantStore>((set, get) => ({
  graftedPlant: null,
  setGraftedPlant: (graftedPlant) => set({ graftedPlant }),
  shouldRefetch: false,
  markForRefetch: () => set({ shouldRefetch: !get().shouldRefetch }),
  isGrowthDetailView: false,
  setIsGrowthDetailView: (value) => set({ isGrowthDetailView: value }),
}));

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

interface CropStore {
  crop: GetCropDetail | null;
  setCrop: (crop: GetCropDetail | null) => void;
  harvestDay: GetHarvestDay | null;
  setHarvestDay: (harvestDays: GetHarvestDay | null) => void;
  shouldRefetch: boolean;
  markForRefetch: () => Promise<void>;
  isHarvestDetailView: boolean;
  setIsHarvestDetailView: (value: boolean) => void;
}

export const useCropStore = create<CropStore>((set, get) => ({
  crop: null,
  setCrop: (crop) => set({ crop }),
  harvestDay: null,
  setHarvestDay: (harvestDay) => set({ harvestDay }),
  shouldRefetch: false,
  markForRefetch: async () => {
    set({ shouldRefetch: !get().shouldRefetch });
    return Promise.resolve();
  },
  isHarvestDetailView: false,
  setIsHarvestDetailView: (value) => set({ isHarvestDetailView: value }),
}));
