import { LOCAL_STORAGE_KEYS } from "@/constants";
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

interface FarmState {
  farmName: string;
  farmLogo: string;
  farmExpiredDate: string;
  setFarmInfo: (name: string, logo: string, expiredDate: string) => void;
}

export const useFarmStore = create<FarmState>((set) => ({
  farmName: localStorage.getItem(LOCAL_STORAGE_KEYS.FARM_NAME) || "",
  farmLogo: localStorage.getItem(LOCAL_STORAGE_KEYS.FARM_LOGO) || "",
  farmExpiredDate: localStorage.getItem(LOCAL_STORAGE_KEYS.FARM_EXPIRED_DATE) || "",
  setFarmInfo: (name?: string, logo?: string, expiredDate?: string) => {
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
      set({ farmExpiredDate: expiredDate });
    }
  },
}));

interface LoadingState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
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
