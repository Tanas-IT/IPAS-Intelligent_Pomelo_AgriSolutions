export interface Province {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
}

export interface Ward {
  id: string;
  name: string;
}

export interface GetPartner {
  partnerId: number;
  partnerCode: string;
  partnerName: string;
  description: string;
  phoneNumber: string;
  createDate: Date;
  major: string;
}

export interface GetPartnerSelected {
  id: number;
  code: string;
  name: string;
}
