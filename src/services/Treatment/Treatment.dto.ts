export interface ITreatmentDetails {
  id: number;
  medicine: string;
  dosage: string;
  doctorNotes: string;
  noteTime: string;
  notes: string;
  isEmergencyTreatment: boolean;
  treatmentId: number;
  admissionId: number;
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
  admissionId: number;
  admission?: {
    id: number;
    ward?: { id: number; name: string };
    wardBedId?: number;
    wardBed?: { id: number; bedNumber: string };
  };
  treatmentDetails?: ITreatmentDetails[];
  purchaseRecommendations?: IPurchaseRecommendation[];
}

export interface IAddTreatment {
  admissionId: number;
}

export interface IUpdateTreatment extends IAddTreatment {
  id: number;
}
