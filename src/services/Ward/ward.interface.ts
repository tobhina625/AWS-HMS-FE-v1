import type { IDepartment } from '../Employee/Employee.interface';

export interface IAddWard {
  name: string;
  noOfBeds: number;
  noOfOxygenSlots: number;
  status?: string;
  description?: string;
  location?: string;
  department: IDepartment;
}

export interface IEditWard {
  id: number;
  name: string;
  noOfBeds: number;
  noOfOxygenSlots: number;
  status?: string;
  description?: string;
  location?: string;
  department: IDepartment;
}

export interface IWard {
  id: number;
  name: string;
  noOfBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  noOfOxygenSlots: number;
  occupiedOxygenSlots: number;
  availableOxygenSlots: number;
  status: string;
  description?: string;
  location?: string;
  department?: IDepartment;
}

export interface IWardBed {
  id: number;
  bedNumber: string;
  wardId: number;
  wardName: string;
  status: string;
  hasOxygen: boolean;
  oxygenInUse: boolean;
  currentPatientId?: number;
  currentPatientName?: string;
  occupiedSince?: string;
  notes?: string;
}

export interface IBedGenerationConfig {
  namingType: 'numeric' | 'prefix';
  prefix?: string;
  startNumber: number;
  oxygenDistribution: 'first_n' | 'range' | 'custom';
  oxygenFromBed?: number;
  oxygenToBed?: number;
  customOxygenBeds?: number[];
}
