import { RootStackParamList } from "@/constants";
import { StackNavigationProp } from "@react-navigation/stack";

export type PlantDetailNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PlantDetail"
>;

export interface PlantDetailProps {
  route: {
    params: {
      plantId: number;
    };
  };
  navigation: PlantDetailNavigationProp;
}

export interface PlantDetailData {
  plantId: number;
  plantCode: string;
  plantName: string;
  plantIndex: number;
  healthStatus: string;
  plantingDate: string;
  description: string;
  masterTypeId: number;
  imageUrl: string;
  landRowId: number;
  rowIndex: number;
  landPlotId: number;
  landPlotName: string;
  masterTypeName: string;
  characteristic: string;
  growthStageName: string;
  isDead: boolean;
  isPassed: boolean;
  growthHistory: PlantGrowthHistory[];
  graftedPlants: GraftedPlantSummary[];
  harvestHistory: HarvestSummary[];
}

export interface PlantGrowthHistory {
  plantGrowthHistoryId: number;
  content: string;
  noteTaker: string;
  createDate: string;
  issueName: string;
  plantId: number;
  numberImage: number;
  numberVideos: number;
  plantResources: string[];
}

interface GraftedPlantSummary {
  graftedPlantID: number;
  graftedPlantCode: string;
  graftedPlantName: string;
  status: string;
  graftedDate: string;
  isCompleted: boolean;
  plantLotID: number;
}

interface HarvestSummary {
  productHarvestHistoryId: number;
  harvestDate: string;
  quantity: number;
  unit: string;
  harvestCount: number;
  productType: string;
  marketValue: number;
}

export interface NoteFormData {
  content: string;
  issueName?: string | undefined;
  // images?: string[];
  images: { uri: string; type: string; name: string }[];
}

export interface GraftedPlant {
  graftedPlantId: number;
  graftedPlantCode: string;
  graftedPlantName: string;
  separatedDate?: string;
  status: string;
  graftedDate: string;
  note?: string;
  isCompleted: boolean;
  isDead: boolean;
  plantLotId: number;
  motherPlantId: number;
  plantCode: string;
  plantName: string;
  cultivarId: string;
  cultivarName: string;
  plantLotName: string;
  plantLotCode: string;
  mortherPlant: MotherPlant;
}

export interface MotherPlant {
  plantId: number;
  plantCode: string;
  plantName: string;
  plantIndex: number;
  healthStatus: string;
  createDate: string;
  updateDate: string;
  plantingDate: string;
  description: string;
  masterTypeId: number;
  imageUrl: string;
  landRowId: number;
  masterTypeName: string;
  characteristic: string;
  growthStageID: number;
  isDead: boolean;
  isPassed: boolean;
  plantLotId: number;
  criteriaSummary: any[];
}

export interface HarvestStatisticResponse {
  yearFrom: number;
  yearTo: number;
  harvestCount: number;
  masterTypeId: number;
  masterTypeCode: string;
  masterTypeName: string;
  totalYearlyQuantity: number;
  numberHarvest: number;
  monthlyData: MonthlyHarvestData[];
}

export interface MonthlyHarvestData {
  month: number;
  year: number;
  totalQuantity: number;
  harvestCount: number;
}