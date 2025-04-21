import { ReactNode } from "react";

export interface FileResource {
  resourceID: number;
  resourceCode: string;
  resourceType: string;
  resourceURL: string;
  fileFormat: string;
  createDate: string;
}

export interface SelectOption {
  value: string | number;
  label: string | ReactNode;
}

export interface MediaFile {
  id?: number;
  uri: string;
  type: string;
  name: string;
}

export interface NoteFormData {
  issueName: string;
  content: string;
  images?: MediaFile[];
  videos?: MediaFile[];
}

export interface BaseHistory {
  createDate: string;
  userId: number;
  noteTakerName: string;
  noteTakerAvatar: string;
  issueName?: string;
  content?: string;
  numberImage: number;
  numberVideos: number;
  resources?: any[];
  plantGrowthHistoryId: number;
  graftedPlantId: number;
  graftedPlantNoteId: number;
}
