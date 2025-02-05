export interface GetProcess {
  processId: number;
  processCode: string;
  processName: string;
  isDefault: boolean;
  isActive: boolean;
  createDate: Date;
  updateDate: Date;
  isDeleted: boolean;
  farmName: string;
  processStyleName: string;
  growthStageName: string;
}
