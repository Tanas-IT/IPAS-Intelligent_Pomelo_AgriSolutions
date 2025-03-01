import { axiosAuth } from "@/api";
import { ApiResponse, GetLandRow } from "@/payloads";
import { getFarmId } from "@/utils";

export const getLandRows = async (landPlotId: number) => {
    const res = await axiosAuth.axiosJsonRequest.get(`landRows/get-for-selected/${landPlotId}`);
    const apiResponse = res.data as ApiResponse<GetLandRow[]>;
    console.log('apiResponse landRowOptions',apiResponse);
    
    return apiResponse;
};