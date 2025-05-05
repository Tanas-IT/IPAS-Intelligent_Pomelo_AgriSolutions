import { axiosAuth } from "@/api";
import { ApiResponse, WeatherData } from "@/payloads";

export const getWeatherDashboard = async (farmId: number) => {
    const res = await axiosAuth.axiosJsonRequest.get(`/report/dashboard/weather?farmId=${farmId}`);
    const apiResponse = res.data as ApiResponse<WeatherData>;
    return apiResponse;
  };