interface documentResources {
  resourceID: string;
  resourceCode: string;
  resourceURL: string;
}

export interface GetFarmDocuments {
  legalDocumentId: string;
  legalDocumentCode: string;
  legalDocumentType: string;
  legalDocumentName: string;
  resources: documentResources[];
}
