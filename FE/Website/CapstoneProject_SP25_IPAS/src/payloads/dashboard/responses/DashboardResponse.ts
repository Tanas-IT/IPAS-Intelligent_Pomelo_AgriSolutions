interface WeatherPropertyModel {
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

interface PomeloQualityBreakDown {
}

export interface ProductivityByPlot {
  harvestSeason: string
  year: number
  landPlots: LandPlot[]
}

export interface LandPlot {
  landPlotId: number
  landPlotName: string
  totalPlantOfLandPlot: number
  quantity: number
  status: string
}


interface WorkProgressOverview {
}

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
  productivityByPlots: ProductivityByPlot[];
  seasonalYields: SeasonalYield[];
  workProgressOverviews: WorkProgressOverview[];
}

export interface MaterialInstore {
  month: string
  materials: Material[]
}

export interface Material {
  productType: string
  unitOfMaterials: UnitOfMaterials
}

export interface UnitOfMaterials {
  value: number
  unit: string
}

export interface SeasonalYieldResponse {
  statusCode: number;
  message: string;
  data: SeasonalYield[];
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