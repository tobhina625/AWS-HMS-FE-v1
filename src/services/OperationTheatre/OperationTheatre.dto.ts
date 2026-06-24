// DTO for Department (used inside Operation Theatre)
export interface IDepartment {
  id: number;
  name: string;
}

// Operation Theatre DTO (for response structure)
export interface IOperationTheatre {
  id: number;
  name: string;
  department: IDepartment | null;
  status: string;
  specialization?: string;
  location?: string;
  capacity: number;
  hasAnesthesiaMachine: boolean;
  hasVentilator: boolean;
  hasMonitoringSystem: boolean;
  hasSurgicalLights: boolean;
  equipmentNotes?: string;
  currentSurgeryId?: number;
  currentSurgeryName?: string;
  currentPatientName?: string;
  currentSurgeryStartTime?: string;
  notes?: string;
  isAvailable: boolean;
  equipmentCount: number;
}

// Add Operation Theatre DTO (for POST request)
export interface IAddOperationTheatre {
  name: string;
  department: {
    id: number;
  } | null;
  status: string;
  specialization?: string;
  location?: string;
  capacity: number;
  hasAnesthesiaMachine: boolean;
  hasVentilator: boolean;
  hasMonitoringSystem: boolean;
  hasSurgicalLights: boolean;
  equipmentNotes?: string;
  notes?: string;
}

// Update Operation Theatre DTO (for PUT request)
export interface IUpdateOperationTheatre {
  id: number;
  name: string;
  department: {
    id: number;
  } | null;
  status: string;
  specialization?: string;
  location?: string;
  capacity: number;
  hasAnesthesiaMachine: boolean;
  hasVentilator: boolean;
  hasMonitoringSystem: boolean;
  hasSurgicalLights: boolean;
  equipmentNotes?: string;
  notes?: string;
}

// Theatre Schedule DTO
export interface ITheatreSchedule {
  id: number;
  theatreId: number;
  theatreName: string;
  surgeryId: number;
  surgeryName: string;
  patientId?: number;
  patientName?: string;
  surgeonId?: number;
  surgeonName?: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: string;
  notes?: string;
  preOperativeNotes?: string;
  postOperativeNotes?: string;
}

// Add Schedule DTO
export interface IAddTheatreSchedule {
  theatreId: number;
  surgeryId: number;
  patientId?: number;
  surgeonId?: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
  notes?: string;
  preOperativeNotes?: string;
}

// Theatre Statistics
export interface ITheatreStatistics {
  totalTheatres: number;
  availableTheatres: number;
  inUseTheatres: number;
  underMaintenanceTheatres: number;
  totalCapacity: number;
  theatresWithAnesthesia: number;
  theatresWithVentilator: number;
  theatresWithMonitoring: number;
  theatresByStatus: Array<{ status: string; count: number }>;
  theatresBySpecialization: Array<{ specialization: string; count: number }>;
}
