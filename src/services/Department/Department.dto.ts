export interface IDepartment {
  id: number;
  name: string;
  status: string;
  description: string;
  location: string;
  headOfDepartment: string;
  phone: string;
  email: string;
  capacity: number;
  establishedDate: string;
}

export interface IAddDepartment {
  name: string;
  status: string;
  description: string;
  location: string;
  headOfDepartment: string;
  phone: string;
  email: string;
  capacity: number;
  establishedDate: string;
}

export interface IUpdateDepartment {
  id: number;
  name: string;
  status: string;
  description: string;
  location: string;
  headOfDepartment: string;
  phone: string;
  email: string;
  capacity: number;
  establishedDate: string;
}

export interface IDepartmentStatistics {
  totalDepartments: number;
  totalCapacity: number;
  averageCapacity: number;
  withHead: number;
  withoutHead: number;
  departmentsByStatus: { status: string; count: number }[];
}
