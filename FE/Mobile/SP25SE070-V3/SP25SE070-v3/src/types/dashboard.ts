export interface ManagerHomeData {
    warning: string[];
    farmOverview: {
        totalPlants: number;
        totalYield: number;
        normalCount: number;
        deadCount: number;
        normalPercentage: number;
        deadPercentage: number;
    };
    workOverview: {
        status: string;
        count: number;
    }[];
}