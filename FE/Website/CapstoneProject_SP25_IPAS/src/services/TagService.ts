import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetTag, TagRequest, TagRes } from "@/payloads";
import { buildParams } from "@/utils";

export const getTags = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetTag>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("ai/get-all-tags-with-pagin", { params });
  const apiResponse = res.data as ApiResponse<GetData<TagRes>>;
  const mappedList = apiResponse.data.list.map(({ id, ...rest }: any) => ({
    ...rest,
    tagId: id,
  }));
  return {
    ...apiResponse.data,
    list: mappedList,
  };
};

export const deleteTag = async (id: string): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.delete(`ai/delete-tag/${id}`);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateTag = async (tag: TagRequest): Promise<ApiResponse<GetTag>> => {
  const payload = {
    updateTagId: tag.tagId,
    newTagName: tag.name,
  };
  const res = await axiosAuth.axiosJsonRequest.put("ai/update-tag", payload);
  const apiResponse = res.data as ApiResponse<GetTag>;
  return apiResponse;
};

export const createUser = async (tag: TagRequest): Promise<ApiResponse<GetTag>> => {
  const payload = {
    tagName: tag.name,
  };
  const res = await axiosAuth.axiosJsonRequest.post(`ai/create-tag`, payload);
  const apiResponse = res.data as ApiResponse<GetTag>;
  return apiResponse;
};
