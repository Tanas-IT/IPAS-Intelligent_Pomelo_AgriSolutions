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
  createDate: string;
  updateDate: string;
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
  growthStageID: number;
  growthStageName: string;
  isDead: boolean;
  isPassed: boolean;
  passedDate: string | null;
  criteriaSummary: CriteriaSummary[];
  growthHistory: PlantGrowthHistory[];
  graftedPlants: GraftedPlantSummary[];
  harvestHistory: HarvestSummary[];
}

interface CriteriaSummary {
  criteriaId: number;
  criteriaName: string;
  value: string;
  unit: string;
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
  images?: string[];
}
