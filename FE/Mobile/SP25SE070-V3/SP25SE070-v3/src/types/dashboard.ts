export interface StatusPercentage {
  healthStatus: string;
  quantity: number;
}

export interface ManagerHomeData {
  warning: string[];
  farmOverview: {
    totalPlants: number;
    totalYield: number;
    statusPercentage: StatusPercentage[];
  };
  workOverview: {
    status: string;
    count: number;
  }[];
}
