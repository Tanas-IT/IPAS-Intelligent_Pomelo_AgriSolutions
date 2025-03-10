export interface PayOSPaymentRequest {
    amount: number;
    description: string;
    farmId: number;
    packageId: number;
}

export interface CreateOrder {
    orderName: string;
    totalPrice: number;
    notes: string;
    packageId: number;
    farmId: number;
    paymentMethod: "PAYOS";
    paymentStatus: "PENDING"
}
