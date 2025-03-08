import { axiosAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import { GetWorklog, GetWorklogDetail } from "@/payloads/worklog";

export const getWorklog = async () => {
    const res = await axiosAuth.axiosJsonRequest.get("work-log/get-all-schedule");
    const apiResponse = res.data as ApiResponse<GetWorklog>;
    return apiResponse;
}

export const getWorklogDetail = async (worklogId: number) => {
    const res = await axiosAuth.axiosJsonRequest.get(`work-log/detail/${worklogId}`);
    const apiResponse = res.data as ApiResponse<GetWorklogDetail>;
    return apiResponse.data;
}