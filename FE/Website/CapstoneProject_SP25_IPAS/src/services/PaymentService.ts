import { axiosAuth } from "@/api";
import { ApiResponse, PayOSPaymentRequest, PayOSPaymentResponse } from "@/payloads";

export const createPaymentLink = async (payload: PayOSPaymentRequest): Promise<ApiResponse<PayOSPaymentResponse>> => {
    const res = await axiosAuth.axiosJsonRequest.post(`payment-payOS/create-payment-link`, payload);
    const apiResponse = res.data as ApiResponse<PayOSPaymentResponse>
    return apiResponse;
}