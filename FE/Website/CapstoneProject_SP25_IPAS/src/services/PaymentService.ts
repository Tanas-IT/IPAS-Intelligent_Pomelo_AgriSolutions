import { axiosAuth } from "@/api";
import {
  ApiResponse,
  CreateOrder,
  CreateOrderResponse,
  GetData,
  GetPaymentHistory,
  handlePaymentRequest,
  HandlePaymentResponse,
  PayOSPaymentRequest,
  PayOSPaymentResponse,
} from "@/payloads";
import { buildParams } from "@/utils";

export const createPaymentLink = async (
  payload: PayOSPaymentRequest,
): Promise<ApiResponse<PayOSPaymentResponse>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`payment/payOS/create-payment-link`, payload);
  const apiResponse = res.data as ApiResponse<PayOSPaymentResponse>;
  return apiResponse;
};

export const createOrder = async (
  payload: CreateOrder,
): Promise<ApiResponse<CreateOrderResponse>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`order`, payload);
  const apiResponse = res.data as ApiResponse<CreateOrderResponse>;
  return apiResponse;
};

export const handlePayment = async (
  payload: handlePaymentRequest,
): Promise<ApiResponse<HandlePaymentResponse>> => {
  const res = await axiosAuth.axiosJsonRequest.put(`payment/handle-payment`, payload);
  const apiResponse = res.data;
  return apiResponse;
};

export const getPaymentHistory = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetPaymentHistory>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("order", { params });
  const apiResponse = res.data as ApiResponse<GetData<GetPaymentHistory>>;
  return apiResponse.data as GetData<GetPaymentHistory>;
};
