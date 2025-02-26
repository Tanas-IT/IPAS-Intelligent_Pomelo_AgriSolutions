import { axiosAuth } from "@/api";
import { ApiResponse, GetLandRow } from "@/payloads";
import { getFarmId } from "@/utils";

export const getLandRows = async (landPlotId: number) => {
    const res = await axiosAuth.axiosJsonRequest.get(`landRows/get-land-rows-of-plot/${landPlotId}`);
    const apiResponse = res.data as ApiResponse<GetLandRow[]>;
    return apiResponse.data.map(({ landRowId, landRowCode }) => ({
        landRowId,
        landRowCode
      }));
};