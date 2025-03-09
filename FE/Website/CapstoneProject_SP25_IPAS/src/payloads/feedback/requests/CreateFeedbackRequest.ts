export interface CreateFeedbackRequest {
    content: string;
    managerId: number;
    worklogId: number;
    status: string;
    reason: string;
  }