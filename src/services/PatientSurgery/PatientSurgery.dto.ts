export interface IPatientSurgery {
  id: number;
  surgeryTime: string;
  endTime: string;
  notes: string;
  surgeryId: number;
  operationTheatreId: number;
  admissionId: number;
  surgery?: {
    id: number;
    name: string;
  };
  operationTheatre?: {
    id: number;
    name: string;
  };
  admission?: {
    id: number;
  };
}

export interface IAddPatientSurgery {
  surgeryTime: string;
  endTime: string;
  notes: string;
  surgeryId: number;
  operationTheatreId: number;
  admissionId: number;
}

export interface IUpdatePatientSurgery extends IAddPatientSurgery {
  id: number;
}
