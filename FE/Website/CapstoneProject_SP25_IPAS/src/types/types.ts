import { GetProp, UploadProps } from "antd";

export interface Farm {
  farmId: number;
  farmName: string;
  location: string;
}

export interface LogoState {
  logo: File | null;
  logoUrl: string;
}

export interface CoordsState {
  longitude: number;
  latitude: number;
}

export interface PolygonInit {
  id: string;
  coordinates: number[][][];
  landPlotId: number;
}

export type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
