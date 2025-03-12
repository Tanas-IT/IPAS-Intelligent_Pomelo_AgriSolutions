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

export interface Package {
    packageId: number;
    packageCode: string;
    packageName: string;
    packagePrice: number;
    duration: number;
    createDate: string;
    status: string;
    isActive: boolean;
    packageDetails: any[];
  }
  
  export interface Payments {
    paymentId: number;
  }
  
  export interface HandlePaymentResponse {
    orderId: number;
    orderCode: string;
    orderName: string;
    totalPrice: number;
    notes: string;
    orderDate: string;
    enrolledDate: string;
    expiredDate: string;
    status: string;
    packageId: number;
    farmId: number;
    package: Package;
    payments: Payments;
  }
  