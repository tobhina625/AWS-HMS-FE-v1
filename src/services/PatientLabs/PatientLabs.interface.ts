export interface ILabTestEntry {
  id?: number;
  entity: string;
  normalMaxValue: number;
  normalMinValue: number;
  recordedValue: number;
  patientLabsId?: number;
}

export interface IPatientLabs {
  id?: number;
  patientId: number;
  patientName?: string;
  patientHistoryId: number;
  labTestId: number;
  labTestName?: string;
  labTestPrice?: number;
  status: string; // Ordered, InProgress, Completed, Cancelled
  reportTime?: string;
  details?: string;
  branchId?: number;
  branchName?: string;
  report?: ILabTestEntry[];
  createdAt?: string;
}

export interface ICreateLabOrder {
  patientId: number;
  patientHistoryId: number;
  labTestId: number;
  details?: string;
  branchId?: number;
}

export interface IUpdateLabResult {
  patientLabsId: number;
  status?: string;
  details?: string;
  testEntries?: ILabTestEntry[];
}
