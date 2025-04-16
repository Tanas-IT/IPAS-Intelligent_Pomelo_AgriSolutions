export interface ReportResponse {
    reportID: number;
    reportCode: string;
    description: string;
    imageURL: string;
    createdDate: string;
    isTrainned: boolean;
    questionerID: number;
    questionerName: string;
    questionOfUser: string;
    answerFromExpert?: string;
    answererName: string;
    status?: "Pending" | "Answered";
  }