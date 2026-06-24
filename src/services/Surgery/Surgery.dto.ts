import type { IDepartment } from '../Employee/Employee.interface';

export interface ISurgery {
  id: number;
  name: string;
  cost: number;
  status: string;
  category: string;
  description?: string;
  location?: string;
  duration: number;
  riskLevel?: string;
  requiresGeneralAnesthesia: boolean;
  requiresBloodBank: boolean;
  requiresICU: boolean;
  isMinimallyInvasive: boolean;
  department?: IDepartment;
  totalProcedures: number;
}

export interface IAddSurgery {
  name: string;
  cost: number;
  status: string;
  category: string;
  description?: string;
  location?: string;
  duration: number;
  riskLevel?: string;
  requiresGeneralAnesthesia: boolean;
  requiresBloodBank: boolean;
  requiresICU: boolean;
  isMinimallyInvasive: boolean;
  department: {
    id: number;
  };
}

export interface IEditSurgery {
  id: number;
  name: string;
  cost: number;
  status: string;
  category: string;
  description?: string;
  location?: string;
  duration: number;
  riskLevel?: string;
  requiresGeneralAnesthesia: boolean;
  requiresBloodBank: boolean;
  requiresICU: boolean;
  isMinimallyInvasive: boolean;
  department: {
    id: number;
  };
}

export interface ISurgeryStatistics {
  totalSurgeries: number;
  averageCost: number;
  totalCost: number;
  averageDuration: number;
  requiringICU: number;
  requiringBloodBank: number;
  requiringAnesthesia: number;
  minimallyInvasive: number;
  surgeriesByStatus: { status: string; count: number }[];
  surgeriesByCategory: { category: string; count: number }[];
}
