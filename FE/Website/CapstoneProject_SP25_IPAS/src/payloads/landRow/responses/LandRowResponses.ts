import { GetPlant, plantSimulate } from "@/payloads/plant";

export interface GetLandRowSelected {
  id: number;
  code: string;
  name: string;
}

export interface GetLandRow {
  landRowId: number;
  landRowCode: string;
  landRowName: string;
  rowIndex: number;
  treeAmount: number;
  indexUsed: number;
  distance: number;
  length: number;
  width: number;
  createDate: Date;
  status: string;
  description: string;
  landPlotId: number;
  landPlotname: string;
  plants: plantSimulate[];
}

export interface landRowSimulate {
  landRowId?: number;
  landRowCode: string;
  rowIndex: number;
  treeAmount: number;
  distance: number;
  length: number;
  width: number;
  indexUsed?: number;
  plants: plantSimulate[];
}

export interface landRowDetail {
  landRowId: number;
  landRowCode: string;
  landPlotname: string;
  rowIndex: number;
  treeAmount: number;
  indexUsed: number;
  plants: GetPlant[];
}
