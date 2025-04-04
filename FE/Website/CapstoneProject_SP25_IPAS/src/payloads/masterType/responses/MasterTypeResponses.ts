export interface MasterTypeDetail {
  masterTypeDetailId: number;
  masterTypeDetailCode: string;
  masterTypeDetailName: string;
  value: string;
  masterTypeId: number;
}

export interface GetMasterType {
  masterTypeId: number;
  masterTypeCode: string;
  masterTypeName: string;
  masterTypeDescription: string;
  backgroundColor: string;
  textColor: string;
  characteristic: string;
  isConflict: boolean;
  target: string;
  typeName: string;
  createDate: Date;
  isActive: boolean;
  minTime: number;
  maxTime: number;
  masterTypeDetailModels: MasterTypeDetail[];
}

export interface GetMasterTypeSelected {
  id: number;
  code: string;
  name: string;
}
