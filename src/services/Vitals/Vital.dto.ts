export interface IVitalRecord {
  id: number;
  admissionId: number;
  recordedByEmployeeId: number;
  recordedAt: string; // ISO date string
  temperature: number;
  pulseRate: number;
  respirationRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  weight?: number;
  notes?: string;
  isEmergency: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAddVitalRecord {
  admissionId: number;
  recordedByEmployeeId: number;
  recordedAt: string;
  temperature: number;
  pulseRate: number;
  respirationRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  weight?: number;
  notes?: string;
  isEmergency: boolean;
}
