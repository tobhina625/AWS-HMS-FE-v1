export interface IAppointmentStatus {
  id: number;
  statusDescription: string;
}

export interface IAppointmentType {
  id: number;
  typeDescription: string;
}

export interface IAppointmentPatient {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface IAppointmentEmployee {
  id: number;
  name: string;
  designation?: string;
  department?: {
    id: number;
    name: string;
  };
}

export interface IAppointment {
  id: number;
  appointmentDateTime: string;
  startTime: string;
  endTime: string;
  createdDate: string;
  updatedDate: string;
  priority: string;
  notes: string;
  location: string;
  reason: string;
  patient: IAppointmentPatient;
  employee: IAppointmentEmployee;
  appointmentStatus: IAppointmentStatus;
  appointmentTypes: IAppointmentType;
}

/** Slot returned by GET /api/appointments/available-slots/{employeeId} */
export interface IAppointmentSlot {
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface IAvailableDoctor {
  id: number;
  name: string;
  specialization?: string;
  slotDurationMinutes?: number;
  department?: { id: number; name: string };
}

export interface IAddAppointment {
  appointmentDateTime: string;
  startTime: string;
  /** Omitted in API calls; server sets from doctor slot duration. */
  endTime?: string;
  priority?: string;
  notes?: string;
  location?: string;
  reason?: string;
  patient: { id: number };
  employee: { id: number };
  appointmentStatus?: { id: number };
  appointmentTypes?: { id: number };
}

export interface IUpdateAppointment {
  id: number;
  appointmentDateTime: string;
  startTime: string;
  /** Omitted in API calls; server sets from doctor slot duration. */
  endTime?: string;
  priority: string;
  notes?: string;
  location: string;
  reason: string;
  patient: { id: number };
  employee: { id: number };
  appointmentStatus: { id: number };
  appointmentTypes: { id: number };
}

export interface IAppointmentStatistics {
  totalAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  appointmentsByStatus: { status: string; count: number }[];
  appointmentsByType: { type: string; count: number }[];
  appointmentsByPriority: { priority: string; count: number }[];
}
