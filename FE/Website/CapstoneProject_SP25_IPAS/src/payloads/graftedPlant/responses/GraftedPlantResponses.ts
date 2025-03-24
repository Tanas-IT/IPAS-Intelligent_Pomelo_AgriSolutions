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
  plantCode: string;
}

export interface GetGraftedPlantDetail extends GetGraftedPlant {}
