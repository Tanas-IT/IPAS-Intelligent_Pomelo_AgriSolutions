import { axiosAuth } from "@/api";
import { ApiResponse, GetData } from "@/payloads";
import { buildParams } from "@/utils";

// export const getPlantList = async (
//   currentPage?: number,
//   rowsPerPage?: number,
//   sortField?: string,
//   sortDirection?: string,
//   searchValue?: string,
//   additionalParams?: Record<string, any>,
// ): Promise<GetData<GetPlant>> => {
//   const params = buildParams(
//     currentPage,
//     rowsPerPage,
//     sortField,
//     sortDirection,
//     searchValue,
//     additionalParams,
//   );
//   const res = await axiosAuth.axiosJsonRequest.get("plants/get-plants-pagin", { params });
//   const apiResponse = res.data as ApiResponse<GetData<GetPlant>>;
//   return apiResponse.data as GetData<GetPlant>;
// };
