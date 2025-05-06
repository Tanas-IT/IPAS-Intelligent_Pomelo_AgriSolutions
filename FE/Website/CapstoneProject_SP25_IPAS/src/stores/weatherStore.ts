import { create } from "zustand";
import { AxiosError } from "axios";
import { WeatherData, WeatherHourly } from "@/payloads";
import { weatherService } from "@/services";

interface WeatherState {
  weather: WeatherData | null;
  forecast: WeatherHourly[];
  place: string;
  isLoading: boolean;
  error: string | null;
  isSearchVisible: boolean;
  setPlace: (place: string) => void;
  fetchWeather: (farmId?: number) => Promise<void>;
  toggleSearch: () => void;
}

const useWeatherStore = create<WeatherState>((set, get) => ({
  weather: null,
  forecast: [],
  place: "Hanoi",
  isLoading: false,
  error: null,
  isSearchVisible: false,

  setPlace: (newPlace: string) => set({ place: newPlace }),

  fetchWeather: async (farmId: number = 1) => {
    const { place, isLoading } = get();
    if (isLoading) return;

    try {
      set({ isLoading: true, error: null });
      const response = await weatherService.getWeatherDashboard(farmId);
      if (response.statusCode === 200) {
        set({
          weather: response.data,
          forecast: response.data.today.hourly,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to fetch weather data");
      }
    } catch (error) {
      console.error("Weather fetch error:", error);
      const errorMessage =
        error instanceof AxiosError && error.response
          ? error.response.data.message || "Could not fetch weather data. Please try again."
          : "Could not fetch weather data. Please try again.";
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  toggleSearch: () => set((state) => ({ isSearchVisible: !state.isSearchVisible })),
}));

export default useWeatherStore;