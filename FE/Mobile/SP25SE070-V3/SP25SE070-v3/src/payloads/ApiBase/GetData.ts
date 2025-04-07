export interface GetData<T> {
  list: T[];
  totalPage: number;
  totalRecord: number;
}

export interface GetGrowthStageData<T> {
  list: T[];
  totalPage: number;
  totalRecord: number;
  maxAgeStart: number;
}
