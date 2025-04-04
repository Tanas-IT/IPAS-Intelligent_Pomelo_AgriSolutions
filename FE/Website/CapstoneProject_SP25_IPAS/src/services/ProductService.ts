import { axiosAuth } from "@/api";
import { ApiResponse, GetMasterType, GetMasterTypeDetail } from "@/payloads";

export const getProduct = async (id: number): Promise<ApiResponse<GetMasterTypeDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`products/criteria-set?productId=${id}`);
  const apiResponse = res.data as ApiResponse<GetMasterTypeDetail>;
  return apiResponse;
};

export const applyProductCriteria = async (
  productId: number,
  criteriaSetId: number,
): Promise<ApiResponse<GetMasterType>> => {
  const payload = {
    productId,
    listCriteriaSet: [criteriaSetId],
  };
  const res = await axiosAuth.axiosJsonRequest.post(`products/criteria-set`, payload);
  const apiResponse = res.data as ApiResponse<GetMasterType>;
  return apiResponse;
};

export const deleteProductCriteria = async (
  productId: number,
  criteriaSetId: number,
): Promise<ApiResponse<GetMasterType>> => {
  const payload = {
    productId,
    criteriaSetId,
  };

  const res = await axiosAuth.axiosJsonRequest.delete(`products/criteria-set`, {
    data: payload,
  });
  const apiResponse = res.data as ApiResponse<GetMasterType>;
  return apiResponse;
};
