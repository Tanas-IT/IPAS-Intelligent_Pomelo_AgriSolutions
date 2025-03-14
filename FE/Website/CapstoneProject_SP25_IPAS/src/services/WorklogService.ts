import { axiosAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import { GetWorklog, GetWorklogDetail, GetWorklogNote } from "@/payloads/worklog";

export const getWorklog = async () => {
    const res = await axiosAuth.axiosJsonRequest.get("work-log/get-all-schedule");
    console.log(res);
    
    const apiResponse = res.data as ApiResponse<GetWorklog[]>;
    return apiResponse.data;
}

export const getWorklogDetail = async (worklogId: number) => {
    const res = await axiosAuth.axiosJsonRequest.get(`work-log/detail/${worklogId}`);
    const apiResponse = res.data as ApiResponse<GetWorklogDetail>;
    return apiResponse.data;
}

export const addWorklogNote = async (
    note: GetWorklogNote,
  ): Promise<ApiResponse<Object>> => {
    const formData = new FormData();
    formData.append("UserId", note.userId);
    formData.append("WorkLogId", note.userWorklogId);
    formData.append("Note", note.notes);
    formData.append("Issue", note.issue);
  
    if (note.Resources && note.Resources.length > 0) {
      note.Resources.forEach((fileResource, index) => {
        formData.append(`Resources[${index}].resourceURL`, fileResource.resourceURL);
      });
    }
  
    const res = await axiosAuth.axiosMultipartForm.post(`work-log/take-note`, formData);
    return res.data as ApiResponse<Object>;
  };
  