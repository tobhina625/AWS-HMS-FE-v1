export interface IDepartment {
  id: number;
  name?: string;
}

export interface IDesignation {
  id: number;
  name?: string;
}

export interface IEmployee {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  cnic: string;
  gender: number;
  qualification: string;
  specialization: string;
  address: string;
  status: string;
  specializationType?: string;
  officeLocation?: string;
  emergencyContact?: string;
  dateOfJoining?: string;
  hasMedicalLicense: boolean;
  hasSurgicalCertification: boolean;
  hasSpecializedTraining: boolean;
  isOnDuty: boolean;
  notes?: string;
  currentShiftId?: number;
  currentShiftType?: string;
  currentShiftStartTime?: string;
  department?: IDepartment;
  designations?: IDesignation[];
  isAvailable?: boolean;
  certificationCount?: number;
  yearsOfService?: number;
}

export interface IAddEmployee {
  name: string;
  email: string;
  phoneNumber: string;
  cnic: string;
  gender: number;
  address: string;
  qualification: string;
  specialization: string;
  status?: string;
  specializationType?: string;
  officeLocation?: string;
  emergencyContact?: string;
  dateOfJoining?: string;
  hasMedicalLicense?: boolean;
  hasSurgicalCertification?: boolean;
  hasSpecializedTraining?: boolean;
  isOnDuty?: boolean;
  notes?: string;
  department?: IDepartment | null;
  designations: IDesignation[];
}

export interface IUpdateEmployee {
  id: number;
  name: string;
  gender: number;
  address: string;
  qualification: string;
  specialization: string;
  status?: string;
  specializationType?: string;
  officeLocation?: string;
  emergencyContact?: string;
  dateOfJoining?: string;
  hasMedicalLicense?: boolean;
  hasSurgicalCertification?: boolean;
  hasSpecializedTraining?: boolean;
  isOnDuty?: boolean;
  notes?: string;
  slotDurationMinutes?: number;
  department?: IDepartment | null;
  designations: IDesignation[];
}

export interface IEmployeeShift {
  id: number;
  employeeId: number;
  employeeName: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  type: string;
  status: string;
  location?: string;
  notes?: string;
  isOvertime: boolean;
  departmentId?: number;
  departmentName?: string;
}
