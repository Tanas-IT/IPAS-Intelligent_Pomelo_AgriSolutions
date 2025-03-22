export interface CreateFeedbackRequest {
    taskFeedbackId?: number;
    content: string;
    managerId: number;
    worklogId: number;
    status: string;
    reason?: string;
  }