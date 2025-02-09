import { Images } from "@/assets";
import { GetFarm, GetFarmDocuments } from "@/payloads";
import { GetPlan } from "@/payloads/plan";

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

export const defaultPlanData: GetPlan = {
  planId: "1",
  planName: "Initial Planting",
  status: "Active",
  planCode: "P-001",
  createDate: new Date("2023-01-01"),
  startDate: new Date("2023-01-01"),
  endDate: new Date("2023-12-01"),
  updateDate: new Date("2023-12-01"),
  isActive: true,
  notes: "Initial planting process for Pomelo trees.",
  planDetail: "Planting Pomelo trees with required spacing and soil preparation.",
  responsibleBy: ["1", "2"],
  frequency: "weekly",
  landPlot: 1001,
  assignorId: "11",
  pesticideName: "Pesticide A",
  maxVolume: 50,
  minVolume: 10,
  processId: "Caring",
  cropId: "pomelo",
  growthStageId: "stage",
  isDelete: false,
  masterTypeId: "planting",
  farmId: "F-001",
  startTime: new Date("2023-01-01T08:00:00"),
  endTime: new Date("2023-01-01T17:00:00"),
  daysOfWeek: [1, 2, 3, 4, 5],
  daysOfMonth: [],
  customDates: [],
}
