import { axiosAuth, axiosNoAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import { GetPackage, PackageRequest } from "@/payloads/package";

export const getPackage = async (): Promise<ApiResponse<GetPackage[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`packages/all`);
  return res.data as ApiResponse<GetPackage[]>;
};

export const deletePackage = async (id: number): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.delete(`packages?packageId=${id}`);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updatePackage = async (pkg: PackageRequest): Promise<ApiResponse<GetPackage>> => {
  const payload = {
    packageId: pkg.packageId,
    packageName: pkg.packageName,
    packagePrice: pkg.packagePrice,
    duration: pkg.duration,
    isActive: pkg.isActive,
    packageDetails: pkg.packageDetails.map((detail) => {
      const { featureName, featureDescription, packageDetailId } = detail;
      return packageDetailId === 0
        ? { featureName, featureDescription }
        : { packageDetailId, featureName, featureDescription };
    }),
  };
  console.log(payload);

  const res = await axiosAuth.axiosJsonRequest.put("packages", payload);
  const apiResponse = res.data as ApiResponse<GetPackage>;
  return apiResponse;
};

export const createPackage = async (pkg: PackageRequest): Promise<ApiResponse<GetPackage>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`packages`, pkg);
  const apiResponse = res.data as ApiResponse<GetPackage>;
  return apiResponse;
};

export const getPackagePurchase = async (): Promise<ApiResponse<GetPackage[]>> => {
  const res = await axiosNoAuth.get(`packages`);
  const apiResponse = res.data as ApiResponse<GetPackage[]>;
  return apiResponse;
};

export const getPackageById = async (packageId: number): Promise<ApiResponse<GetPackage>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`packages/${packageId}`);
  const apiResponse = res.data as ApiResponse<GetPackage>;
  return apiResponse;
};

export const getPackageSelected = async (): Promise<ApiResponse<GetPackage[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`packages`);
  const apiResponse = res.data as ApiResponse<GetPackage[]>;
  return apiResponse;
};
