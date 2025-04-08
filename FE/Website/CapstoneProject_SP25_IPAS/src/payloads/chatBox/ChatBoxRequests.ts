export interface MessageRequest {
  masterTypeId: number;
  masterTypeName: string;
  masterTypeDescription: string;
  isActive: boolean;
  createBy?: string;
  target: string;
}
