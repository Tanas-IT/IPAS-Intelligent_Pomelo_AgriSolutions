export interface SystemConfigRequest {
  configId?: number;
  configGroup?: string;
  configKey?: string;
  configValue: string;
  isActive?: boolean;
  description: string;
  referenceKeyId?: number;
}
