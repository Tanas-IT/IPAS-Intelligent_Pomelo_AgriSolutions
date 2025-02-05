import { Images } from "@/assets";
import { GetFarm, GetFarmDocuments } from "@/payloads";

export const getDefaultFarm = (): GetFarm => ({
  farmCode: "F12345",
  farmId: 1,
  farmName: "Tan Trieu Pomelo Farm",
  logoUrl: Images.logo,
  address: "123 Farm Road",
  district: "Gò Vấp",
  ward: "12",
  province: "Hồ Chí Minh",
  description:
    "Farm ABC is dedicated to providing organic vegetables grown with care and respect for nature.",
  area: "5000",
  soilType: "Loamy",
  climateZone: "Tropical",
});

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
