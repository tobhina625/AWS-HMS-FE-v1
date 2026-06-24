export interface ITreatmentDetails {
  id: number;
  medicine: string;
  noteTime: string;
  notes: string;
  isEmergencyTreatment: boolean;
  treatmentId: number;
}

export interface IPurchaseRecommendation {
  id: number;
  product: string;
  quantity: number;
  recommendationDate: string;
  treatmentId: number;
}

export interface ITreatment {
  id: number;
  bedNumber: number;
  vitalStatsOnAdmission?: any;
  wardId: number;
  admissionId: number;
  ward?: {
    id: number;
    name: string;
  };
  admission?: {
    id: number;
  };
  treatmentDetails?: ITreatmentDetails[];
  purchaseRecommendations?: IPurchaseRecommendation[];
}

export interface IAddTreatment {
  bedNumber: number;
  vitalStatsOnAdmission?: any;
  wardId: number;
  admissionId: number;
}

export interface IUpdateTreatment extends IAddTreatment {
  id: number;
}
