export interface IPatientHistoryNote {
  id: number;
  notes: string;
  patientHistoryId: number;
  createdAt?: string;
}

export interface IAddPatientHistoryNote {
  notes: string;
  patientHistoryId: number;
}

export interface IUpdatePatientHistoryNote extends IAddPatientHistoryNote {
  id: number;
}
