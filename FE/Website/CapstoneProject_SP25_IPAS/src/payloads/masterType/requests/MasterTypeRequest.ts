export interface MasterTypeDetailRequest {
  masterTypeDetailName: string;
  value: string;
}

export interface MasterTypeRequest {
  masterTypeId: number;
  masterTypeName: string;
  masterTypeDescription: string;
  typeName: string;
  isActive: boolean;
  masterTypeDetailModels: MasterTypeDetailRequest[];
}
