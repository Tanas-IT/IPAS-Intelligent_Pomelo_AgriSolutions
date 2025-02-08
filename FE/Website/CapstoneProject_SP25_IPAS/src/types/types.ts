export interface Farm {
  farmId: number;
  farmName: string;
  location: string;
}

export interface LogoState {
  logo: File | null;
  logoUrl: string;
}
