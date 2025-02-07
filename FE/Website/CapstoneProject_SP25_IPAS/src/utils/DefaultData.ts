import { Images } from "@/assets";
import { GetFarmDocuments, GetFarmInfo } from "@/payloads";
import { LogoState } from "@/types";

export const getDefaultFarm = (): GetFarmInfo => ({
  farmCode: "",
  farmId: 0,
  farmName: "",
  logo: undefined,
  logoUrl: "",
  address: "",
  provinceId: "",
  province: "",
  districtId: "",
  district: "",
  wardId: "",
  ward: "",
  description: "",
  area: "",
  length: "",
  width: "",
  soilType: "",
  climateZone: "",
  createDate: new Date(),
  status: "Inactive",
  longitude: 0,
  latitude: 0,
  owner: {
    email: "",
    fullName: "",
    phoneNumber: "",
  },
});

export const defaultLogoFarm: LogoState = {
  logo: null,
  logoUrl: "",
};

export const defaultFarmDocuments: GetFarmDocuments = {
  landOwnershipCertificate: [],
  landOwnershipCertificateUrls: [Images.logo, Images.logo],
  operatingLicense: [],
  operatingLicenseUrls: [],
  landLeaseAgreement: [],
  landLeaseAgreementUrls: [],
  pesticideUseLicense: [],
  pesticideUseLicenseUrls: [],
};
