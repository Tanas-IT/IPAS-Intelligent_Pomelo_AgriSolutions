import { Images } from "@/assets";
import { GetFarm, GetFarmDocuments } from "@/payloads";

// export const getDefaultFarm = (): GetFarm => ({
//   farmCode: "F12345",
//   farmId: 1,
//   farmName: "Tan Trieu Pomelo Farm",
//   logoUrl: Images.logo,
//   address: "133/17 Hương Lộ 9",
//   district: "Vĩnh Cửu",
//   ward: "Tân Bình",
//   province: "Đồng Nai",
//   description:
//     "Farm ABC is dedicated to providing organic vegetables grown with care and respect for nature.",
//   area: "5000",
//   soilType: "Loamy",
//   climateZone: "Tropical",
// });

export const getDefaultFarm = (): GetFarm => ({
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
  soilType: "",
  climateZone: "",
  createDate: new Date(),
  owner: {
    email: "",
    fullName: "",
    phoneNumber: "",
  },
  farmCoordinations: [
    {
      farmCoordinationId: "",
      longitude: 0,
      lagtitude: 0,
    },
  ],
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
