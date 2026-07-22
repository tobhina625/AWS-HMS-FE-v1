export interface IPatientDiagnosis {
  id?: number;
  patientId: number;
  patientHistoryId?: number;
  diseaseId?: number;
  diagnosisCode?: string;
  diseaseName: string;
  diagnosisType?: string; // Primary, Secondary, Working, Final
  status?: string; // Active, Resolved, Chronic
  notes?: string;
  branchId?: number;
  patientName?: string;
}
