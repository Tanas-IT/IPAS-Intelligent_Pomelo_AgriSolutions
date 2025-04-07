export interface AnswerReportRequest {
    reportId: number
    answer: string
}

export interface AssignTagRequest {
    reportId: number
    tagId: string
}

export interface GetImageRequest {
    tagName?: string
    orderBy?: string
    pageIndex?: number
    pageSize?: number
}