export interface GetSystemConfigSelected {
  id: string;
  code: string;
  name: string;
}

export interface GetSystemConfig {
  configId: number;
  configGroup: string;
  configKey: string;
  configValue: string;
  description: string;
  isActive: boolean;
  isDeleteable: boolean;
  createDate: string;
  referenceKeyId?: number;
}

export interface GetSystemConfigGroup {
  name: string;
}
