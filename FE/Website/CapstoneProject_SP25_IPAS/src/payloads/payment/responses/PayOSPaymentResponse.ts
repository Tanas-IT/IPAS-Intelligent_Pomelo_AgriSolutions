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

export interface CreateOrderResponse {
    orderId: number;
    orderCode: string;
    totalPrice: number;
    notes: string;
    orderDate: string;
    enrolledDate: string;
    expiredDate: string;
    packageId: number;
    farmId: number;
    payments: {
        paymentId: number
    }
}
