export interface PayOSPaymentResponse {
    bin: string;
    accountNumber: string;
    amount: number;
    description: string;
    orderCode: number;
    currency: string;
    paymentLinkId: string;
    status: "PENDING" | "SUCCESS" | "FAILED";
    checkoutUrl: string;
    qrCode: string;
}
