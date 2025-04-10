export interface Package {
    packageId: number;
    packageCode: string;
    packageName: string;
    packagePrice: number;
    duration: number;
    isActive: boolean;
    createDate: string;
    status: string;
}

export interface GetOrder {
    orderId: number;
    orderCode: string;
    orderName: string;
    totalPrice: number;
    notes: string | null;
    status: string;
    orderDate: string;
    enrolledDate: string | null;
    expiredDate: string | null;
    packageId: number;
    farmId: number;
    farmName: string;
    package: Package;
}