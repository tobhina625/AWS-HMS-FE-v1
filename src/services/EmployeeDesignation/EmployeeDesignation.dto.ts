export interface IEmployeeDesignation {
  id: number;
  employeeId: number;
  designationId: number;
  employee?: {
    id: number;
    name: string;
  };
  designation?: {
    id: number;
    name: string;
  };
}

export interface IAddEmployeeDesignation {
  employeeId: number;
  designationId: number;
}

export interface IUpdateEmployeeDesignation extends IAddEmployeeDesignation {
  id: number;
}
