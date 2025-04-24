import { GetPaymentHistory } from "@/payloads/payment";
import { GetUser2 } from "@/payloads/user";

export interface WeatherPropertyModel {
  currentTemp: number;
  tempMax: number;
  tempMin: number;
  status: string;
  description: string;
  humidity: number;
  visibility: number;
  windSpeed: string;
  clouds: number;
}

interface PlantDevelopmentDistribution {
  [stage: string]: number;
}

interface PlantHealthStatus {
  [status: string]: number;
}

interface TaskStatusDistribution {
  totalTask: number;
  taskStatus: Record<string, number>;
}

interface MaterialInStoreModel {
  season: string;
  count: number;
  typeOfProduct: {
    plantName: string;
    masterTypeName: string;
    totalQuantity: number;
  }[];
}

interface PomeloQualityBreakDown { }

export interface ProductivityByPlotResponse {
  harvestSeason: string;
  year: number;
  landPlots: LandPlot[];
}

export interface LandPlot {
  landPlotId: number;
  landPlotName: string;
  totalPlantOfLandPlot: number;
  quantity: number;
  status: string;
}

interface WorkProgressOverview { }

export interface DashboardResponses {
  totalPlant: number;
  totalEmployee: number;
  totalTask: number;
  weatherPropertyModel: WeatherPropertyModel;
  plantDevelopmentDistribution: PlantDevelopmentDistribution;
  plantDevelopmentStages: PlantDevelopmentDistribution;
  plantHealthStatus: PlantHealthStatus;
  taskStatusDistribution: TaskStatusDistribution;
  materialsInStoreModels: MaterialInStoreModel[];
  pomeloQualityBreakDowns: PomeloQualityBreakDown[];
  productivityByPlots: ProductivityByPlotResponse[];
  seasonalYields: SeasonalYield[];
  workProgressOverviews: WorkProgressOverview[];
  taskComplete: number;
}

export interface RevenueMonth {
  year: number;
  month: number;
  totalRevenue: number;
}

export interface RevenueByMonth {
  totalRevenueYear: number;
  revenueMonths: RevenueMonth[];
}

export interface FarmMonth {
  year: number;
  month: number;
  totalRevenue: number;
}

export interface FarmCountByMonth {
  totalRevenueYear: number;
  year: number;
  revenueMonths: FarmMonth[];
}

export interface AdminDashboardResponses {
  totalUser: number;
  totalRevenue: number;
  totalFarm: number;
  statisticRevenueYear: RevenueByMonth;
  statisticFarmYear: FarmCountByMonth;
  newestUserModels: GetUser2[];
  newestOrdersModels: GetPaymentHistory[];
}

export interface MaterialInstore {
  month: string;
  materials: Material[];
}

export interface Material {
  productType: string;
  unitOfMaterials: UnitOfMaterials;
}

export interface UnitOfMaterials {
  value: number;
  unit: string;
}

export interface SeasonalYieldResponse {
  statusCode: number;
  message: string;
  data: SeasonalYield[];
}

export interface DeadAndAlive {
  total: number;
  normalPercentage: number;
  deadPercentage: number;
}

export interface SeasonalYield {
  harvestSeason: string;
  qualityStats: {
    qualityType: string;
    quantityYield: number;
  }[];
}

export interface PomeloQualityBreakdownResponse {
  harvestSeason: string;
  qualityStats: {
    qualityType: string;
    percentage: number;
  }[];
}

export interface StatisticPlanData {
  plansByMonth: {
    month: number;
    totalPlans: number;
  }[];
  statusDistribution: Record<string, number>;
  planByWorkType: Record<string, number>;
  statusSummary: {
    total: number;
    status: Record<string, number>;
  };
}

export interface EmployeeListItem {
  employeeId: number;
  name: string;
  score: number;
  taskSuccess: number;
  taskFail: number;
  totaTask: number;
  avatar: string;
}

export interface CompareWorkPerformanceRequest {
  listEmployee: number[];
}

export type CompareWorkPerformanceResponse = EmployeeListItem[];
