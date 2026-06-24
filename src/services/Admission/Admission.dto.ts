export interface IAdmission {
  id: number;
  patientId?: number;
  patient?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  patientName?: string;
  status: number;
  admissionDate: string;
  dischargeDate?: string | null;
  totalChargesPayable: number;
  patientHistoryId?: number | null;
  patientHistory?: {
    id: number;
    patientName: string;
  };
}

export interface IAddAdmission {
  patientId: number;
  status: number;
  admissionDate: string;
  dischargeDate?: string | null;
  totalChargesPayable?: number;
  reasonForAdmission?: string;
  patientHistory?: { id: number } | null;
  ward?: { id: number } | null;
  /** When set, assigns this bed; otherwise the API picks the first available bed in the ward. */
  wardBedId?: number | null;
  attendingDoctor?: { id: number } | null;
}

export interface IUpdateAdmission extends IAddAdmission {
  id: number;
}

export interface IAdmissionQueueSummary {
  needsBedCount: number;
  preAdmissionPipelineCount: number;
  totalNonDeleted: number;
}
