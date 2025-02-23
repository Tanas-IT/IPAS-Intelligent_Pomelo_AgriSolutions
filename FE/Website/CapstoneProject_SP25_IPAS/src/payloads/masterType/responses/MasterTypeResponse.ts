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
  typeName: string;
  createDate: Date;
  isActive: boolean;
}
