export interface IAvailability {
  id: number;
  availabileDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  employeeId: number;
  branchId?: number;
  dayOfWeek?: string;
  employee?: {
    id: number;
    name: string;
  };
  branch?: {
    id: number;
    name: string;
  };
  isAvailable: boolean;
}

export interface IEmployeeAvailabilitySummary {
  employeeId: number;
  employeeName: string;
  branchId?: number;
  branchName?: string;
  availabilityCount: number;
}

export interface IAvailabilitySlot {
  id: number;
  employeeId: number;
  dayOfWeek?: string;
  availabileDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  startTimeOfDay?: string;
  endTimeOfDay?: string;
  isAvailable: boolean;
  branchId?: number;
}

export interface IEmployeeAvailabilityDetail {
  employeeId: number;
  employeeName: string;
  branchId?: number;
  branchName?: string;
  availabilities: IAvailabilitySlot[];
}

export interface IAddAvailability {
  availabileDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  employeeId: number;
  branchId?: number;
  dayOfWeek?: string;
  isAvailable: boolean;
}

export interface IUpdateAvailability extends IAddAvailability {
  id: number;
}
