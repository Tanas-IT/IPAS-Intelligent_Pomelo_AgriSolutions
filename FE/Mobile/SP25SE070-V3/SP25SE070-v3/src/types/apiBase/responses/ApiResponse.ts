export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    // isSuccess: boolean;
    // errors: IDictionary<string[]>;
    data: T;
  }