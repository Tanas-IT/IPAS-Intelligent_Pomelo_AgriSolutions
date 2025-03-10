export interface PackageDetail {
  packageDetailId: number;
  packageDetailCode: string;
  featureName: string;
  featureDescription: string;
  packageId: number;
}

export interface GetPackage {
  packageId: number;
  packageCode: string;
  packageName: string;
  packagePrice: number;
  duration: number;
  createDate: string;
  status: string;
  isActive: boolean;
  packageDetails: PackageDetail[];
}
