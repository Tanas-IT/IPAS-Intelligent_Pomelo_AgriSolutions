export interface MasterTypeDetailRequest {
  masterTypeDetailName: string;
  value: string;
}

export interface MasterTypeRequest {
  masterTypeId: number;
  masterTypeName: string;
  masterTypeDescription: string;
  backgroundColor: string;
  textColor: string;
  characteristic: string;
  typeName: string;
  isActive: boolean;
  createBy?: string;
  isConflict: boolean;
  target: string;
  // masterTypeDetailModels: MasterTypeDetailRequest[];
}
