import { axiosAuth } from "@/api";
import { AnswerReportRequest, ApiResponse, AssignTagRequest, GetData, GetImageRequest, GetImageResponse, GetReportResponse, GetTagResponse } from "@/payloads";
import { buildParams } from "@/utils";

export const getAllImage = async (req: GetImageRequest): Promise<ApiResponse<GetImageResponse[]>> => {
    const params = buildParams(
        req.pageIndex,
        req.pageSize,
        req.orderBy,
        req.tagName,
    );
    const res = await axiosAuth.axiosJsonRequest.get(`ai/get-all-image`, { params });
    const apiResponse = res.data as ApiResponse<GetImageResponse[]>;
    return apiResponse;
};

export const getAllReports = async (
    search?: string,
    sortBy?: string,
    direction?: string,
    isTrainned?: boolean,
    isUnanswered?: boolean
  ): Promise<ApiResponse<GetData<GetReportResponse>>> => {
    const params = new URLSearchParams();
    if (search) params.append("Search", search);
    if (sortBy) params.append("SortBy", sortBy);
    if (direction) params.append("Direction", direction);
    if (isTrainned !== undefined) params.append("IsTrainned", isTrainned.toString());
    if (isUnanswered !== undefined) params.append("IsUnanswered", isUnanswered.toString());
    const res = await axiosAuth.axiosJsonRequest.get(`report-of-user/get-all?${params.toString()}`);
    console.log('Responseeeee:', res);
    
    return res.data as ApiResponse<GetData<GetReportResponse>>;
};

export const getAllReportsOfUser = async (userId: number): Promise<ApiResponse<GetReportResponse[]>> => {
    const res = await axiosAuth.axiosJsonRequest.get(`report-of-user/get-report-of-user?userId=${userId}`);
    return res.data as ApiResponse<GetReportResponse[]>;
};

export const answerReport = async (data: AnswerReportRequest): Promise<ApiResponse<Object>> => {
    const res = await axiosAuth.axiosJsonRequest.post('report-of-user/answer-report', data);
    return res.data as ApiResponse<Object>;
};

export const getTags = async (): Promise<ApiResponse<GetTagResponse[]>> => {
    const res = await axiosAuth.axiosJsonRequest.get('ai/get-all-tags');
    return res.data as ApiResponse<GetTagResponse[]>;
};

export const assignTag = async (data: AssignTagRequest): Promise<ApiResponse<Object>> => {
    const res = await axiosAuth.axiosJsonRequest.post('report-of-user/assign-tag-to-image', data);
    return res.data as ApiResponse<Object>;
};

export const addTag = async (tagName: string): Promise<ApiResponse<Object>> => {
    const res = await axiosAuth.axiosJsonRequest.post('ai/create-tag', { tagName });
    return res.data as ApiResponse<Object>;
};

export const updateTag = async (updateTagId: string, newTagName: string): Promise<ApiResponse<Object>> => {
    const res = await axiosAuth.axiosJsonRequest.put(`ai/update-tag/${updateTagId}`, { newTagName });
    return res.data as ApiResponse<Object>;
};

export const deleteTag = async (tagId: string): Promise<ApiResponse<Object>> => {
    const res = await axiosAuth.axiosJsonRequest.delete(`ai/delete-tag/${tagId}`);
    return res.data as ApiResponse<Object>;
};

//còn 2 api upload image by file