export interface IDesignation {
  id: string;
}

// export interface IPrescription {
//   medicine: string;
//   shouldTakeInMorning: boolean;
//   shouldTakeInAfternoon: boolean;
//   shouldTakeInNight: boolean;
//   dosage: string;
// }

export interface IPatient {
  id: string;
}

export interface IEmployee {
  designations: IDesignation[];
}

export interface IDisease {
  id: string;
}

export interface IPatientHistory {
  visitDate: string;
  isEmergency: boolean;
  adviseAdmission: boolean;
  symptom: string;
  prescriptionText: string;
  disease: IDisease;
  employee: IEmployee;
  patient: IPatient;
}
