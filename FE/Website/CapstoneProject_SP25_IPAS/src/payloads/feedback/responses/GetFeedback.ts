export interface GetFeedback {
    taskFeedbackId: number;
    taskFeedbackCode: string;
    content: string;
    createDate: string;
    worklogId: number;
    managerId: number;
    status: "Redo";
}