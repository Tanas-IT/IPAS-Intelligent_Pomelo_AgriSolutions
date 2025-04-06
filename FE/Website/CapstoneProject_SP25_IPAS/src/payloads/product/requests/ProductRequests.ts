export interface ProductRequest {
  masterTypeId: number;
  masterTypeName: string;
  masterTypeDescription: string;
  typeName: string;
  isActive: boolean;
  createBy?: string;
}
