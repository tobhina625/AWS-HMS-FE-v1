export interface IAddPatient {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  phone: string;
  cnic: string;
  gender: number;
  address: string;
  nationality?: string;
  passportNumber?: string;
  guardianCNIC?: string;
}

export interface IEditPatient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  phone: string;
  cnic: string;
  gender: number;
  address: string;
  nationality?: string;
  passportNumber?: string;
  guardianCNIC?: string;
}

export interface IPatient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  age: number;
  phone: string;
  cnic: string;
  gender: string | number;
  address: string;
  nationality?: string;
  passportNumber?: string;
  guardianCNIC?: string;
}
