export interface GetImageResponse {
    id: string
    created: string
    width: number
    height: number
    resizedImageUri: string
    thumbnailUri: string
    originalImageUri: string
}

export interface GetReportResponse {
    reportID: number
    reportCode: string
    description: string
    isTrainned: boolean
    answererID: number
    answererName: string
    questionerID: number
    questionerName: string
    questionOfUser: string
    answerFromExpert: string
    image?: GetImageResponse
}

export interface GetTagResponse {
    id: string
    name: string
    type: string
    imageCount: number
  }
  