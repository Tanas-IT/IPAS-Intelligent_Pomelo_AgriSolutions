import { PackageDetail } from "../responses";

export interface PackageRequest {
  packageId?: number;
  packageName: string;
  packagePrice: number;
  duration: number;
  isActive: boolean;
  packageDetails: PackageDetail[];
}
