import { axiosAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import { GetWorklog } from "@/payloads/worklog";

export const getWorklog = async () => {
    const res = await axiosAuth.axiosJsonRequest.get("work-log/get-all-schedule");
    const apiResponse = res.data as ApiResponse<GetWorklog>;
    return apiResponse;
}