// DTO for Role (used inside Designation)
export interface IRole {
  id: number;
  name: string;
}

// Designation DTO (for response structure)
export interface IDesignation {
  id: number;
  name: string;
  status: string;
  description: string;
  level: string;
  minSalary: number | null;
  maxSalary: number | null;
  responsibilities: string;
  role: IRole;
}

// Add Designation DTO (for POST request)
export interface IAddDesignation {
  name: string;
  status: string;
  description: string;
  level: string;
  minSalary: number | null;
  maxSalary: number | null;
  responsibilities: string;
  role: {
    id: number;
  };
}

// Update Designation DTO (for PUT request)
export interface IUpdateDesignation {
  id: number;
  name: string;
  status: string;
  description: string;
  level: string;
  minSalary: number | null;
  maxSalary: number | null;
  responsibilities: string;
  roleId: number;
}

// Statistics interface
export interface IDesignationStatistics {
  totalDesignations: number;
  activeDesignations: number;
  averageMinSalary: number;
  averageMaxSalary: number;
  designationsByStatus: { status: string; count: number }[];
  designationsByRole: { role: string; count: number }[];
  designationsByLevel: { level: string; count: number }[];
}
