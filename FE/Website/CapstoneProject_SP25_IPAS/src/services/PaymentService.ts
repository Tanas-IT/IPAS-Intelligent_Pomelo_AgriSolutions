import { axiosAuth } from "@/api";
import { ApiResponse, CreateOrder, CreateOrderResponse, PayOSPaymentRequest, PayOSPaymentResponse } from "@/payloads";

export const createPaymentLink = async (payload: PayOSPaymentRequest): Promise<ApiResponse<PayOSPaymentResponse>> => {
    const res = await axiosAuth.axiosJsonRequest.post(`payment/payOS/create-payment-link`, payload);
    const apiResponse = res.data as ApiResponse<PayOSPaymentResponse>
    return apiResponse;
}

export const createOrder = async (payload: CreateOrder): Promise<ApiResponse<CreateOrderResponse>> => {
    const res = await axiosAuth.axiosJsonRequest.post(`order`, payload);
    const apiResponse = res.data as ApiResponse<CreateOrderResponse>
    return apiResponse;
}