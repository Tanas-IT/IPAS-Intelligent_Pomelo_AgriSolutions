import { axiosAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import { CancelWorklogRequest, GetWorklog, UpdateStatusWorklogRequest, WorklogDetail, WorklogNoteFormData } from "@/types";

export const getWorklog = async (filters: {
    workDateFrom?: string;
    workDateTo?: string;
    growthStage?: string[];
    status?: string[];
    employees?: string[];
    plan?: string[];
    typePlan?: string[];
}) => {
    const params = {
        workDateFrom: filters.workDateFrom,
        workDateTo: filters.workDateTo,
        growthStage: filters.growthStage?.join(","),
        status: filters.status?.join(","),
        employees: filters.employees?.join(","),
        // typePlan: filters.plan?.join(','),
        typePlan: filters.typePlan?.join(","),
    };

    const res = await axiosAuth.axiosJsonRequest.get("work-log/get-all-schedule", { params });
    console.log("result of worklog filter", res);

    const apiResponse = res.data as ApiResponse<GetWorklog[]>;
    return apiResponse.data;
}

export const getWorklogByUserId = async (userId: number) => {
    const res = await axiosAuth.axiosJsonRequest.get(`work-log/get-schedule?userId=${userId}`);
    const apiResponse = res.data as ApiResponse<GetWorklog[]>;
    return apiResponse.data;
}

export const getWorklogDetail = async (worklogId: number) => {
    const res = await axiosAuth.axiosJsonRequest.get(`work-log/detail/${worklogId}`);
    const apiResponse = res.data as ApiResponse<WorklogDetail>;
    return apiResponse.data;
};

export const cancelWorklog = async (payload: CancelWorklogRequest): Promise<ApiResponse<Object>> => {
    const res = await axiosAuth.axiosJsonRequest.put(`work-log/cancelled-workLog`, payload);
    const apiResponse = res.data as ApiResponse<Object>;
    return apiResponse;
}

export const updateStatusWorklog = async (payload: UpdateStatusWorklogRequest): Promise<ApiResponse<Object>> => {
    const res = await axiosAuth.axiosJsonRequest.put(`work-log/update-status-of-workLog`, payload);
    const apiResponse = res.data as ApiResponse<Object>;
    return apiResponse;
}

export const addWorklogNote = async (
    payload: WorklogNoteFormData
  ): Promise<ApiResponse<object>> => {
    try {
      const formData = new FormData();
  
      // Thêm các trường text
      formData.append("UserId", payload.userId?.toString() || "");
      formData.append("WorkLogId", payload.workLogId?.toString() || "");
      formData.append("Note", payload.note || "");
      formData.append("Issue", payload.issue || "");
  
      // Thêm resources (ảnh) nếu có
      if (payload.resources && payload.resources.length > 0) {
        payload.resources.forEach((resource, index) => {
          const file = {
            uri: resource.resourceURL, // URI từ ImagePicker
            type: resource.fileFormat || "image/jpeg", // Định dạng file
            name: `resource_${index}.${resource.fileFormat?.split("/")[1] || "jpg"}`, // Tên file tạm
          };
          formData.append("Resources", file as any); // Thêm từng file vào formData
        });
      }
  
      const res = await axiosAuth.axiosMultipartForm.post(
        `/work-log/add-note`, // Giả định endpoint
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const apiResponse = res.data as ApiResponse<object>;
      return apiResponse;
    } catch (error) {
      throw error;
    }
  };