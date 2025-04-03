export interface PestDetectionRequest {
    imageURL: string;
}

export interface PestDetectionResult {
    probability: number;
    tagId: string;
    tagName: string;
    tagType: string;
}

export interface PestReportRequest {
    description: string;
    imageFile: string;
    questionerID: number;
    questionOfUser: string;
}

export interface PestReportResponse {
    reportID: number;
    reportCode: string;
    questionOfUser: string;
    description: string;
    imageURL: string;
    createdDate: string;
    isTrainned: boolean;
    questionerID: number;
}