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
  
  interface ProductivityByPlot {
  }
  
  interface SeasonalYield {
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
  