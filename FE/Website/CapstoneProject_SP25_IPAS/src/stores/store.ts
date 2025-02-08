import { LOCAL_STORAGE_KEYS } from "@/constants";
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
  setFarmInfo: (name: string, logo: string) => void;
}

export const useFarmStore = create<FarmState>((set) => ({
  farmName: localStorage.getItem(LOCAL_STORAGE_KEYS.FARM_NAME) || "",
  farmLogo: localStorage.getItem(LOCAL_STORAGE_KEYS.FARM_LOGO) || "",
  setFarmInfo: (name?: string, logo?: string) => {
    if (name) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.FARM_NAME, name);
      set({ farmName: name });
    }
    if (logo) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.FARM_LOGO, logo);
      set({ farmLogo: logo });
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
