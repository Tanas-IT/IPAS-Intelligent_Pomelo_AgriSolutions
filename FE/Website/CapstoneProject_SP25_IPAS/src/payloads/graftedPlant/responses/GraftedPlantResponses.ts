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
