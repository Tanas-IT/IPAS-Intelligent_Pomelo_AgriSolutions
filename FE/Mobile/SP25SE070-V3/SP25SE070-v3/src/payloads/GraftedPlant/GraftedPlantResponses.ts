import { FileResource } from "@/types";

export interface GetGraftedPlantSelected {
  id: number;
  code: string;
  name: string;
}

export interface GetGraftedPlant {
  graftedPlantId: number;
  graftedPlantCode: string;
  graftedPlantName: string;
  separatedDate: string;
  status: string;
  graftedDate: string;
  note: string;
  cultivarId: number;
  cultivarName: string;
  isCompleted: boolean;
  isDead: boolean;
  plantLotId: number;
  plantLotName: string;
  plantCode: string;
  plantName: string;
}

export interface GetGraftedPlantDetail extends GetGraftedPlant {}

export interface GraftedPlant {
  name: string;
  isCompleted: boolean;
  status: string;
}

export interface GetGraftedPlantHistory {
  graftedDate: string;
  totalBranches: number;
  completedCount: number;
  listGrafted: GraftedPlant[];
}

export interface GetGraftedGrowthHistory {
  graftedPlantId: number;
  graftedPlantNoteId: number;
  issueName: string;
  content: string;
  noteTakerName: string;
  noteTakerAvatar: string;
  createDate: string;
  numberImage: number;
  numberVideos: number;
  resources: FileResource[];
}
