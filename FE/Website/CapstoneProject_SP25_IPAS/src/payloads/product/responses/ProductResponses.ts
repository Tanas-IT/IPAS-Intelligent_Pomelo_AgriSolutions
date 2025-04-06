import { GetCriteria } from "@/payloads";

export interface GetProduct {
  masterTypeId: number;
  masterTypeCode: string;
  masterTypeName: string;
  masterTypeDescription: string;
  target: string;
  typeName: string;
  createDate: Date;
  isActive: boolean;
  criterias: GetCriteria[];
}
