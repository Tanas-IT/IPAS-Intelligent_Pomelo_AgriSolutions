export interface GetPackage {
  packageId: number;
  packageCode: string;
  packageName: string;
  packagePrice: number;
  createDate: Date;
  startDate: Date;
  duration: number;
  isActive: boolean;
  totalPurchases: number
}
