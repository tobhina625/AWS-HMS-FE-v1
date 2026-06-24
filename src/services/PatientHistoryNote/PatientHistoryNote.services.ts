import GenericService from '../g-service';
import type { IAddPatientHistoryNote, IUpdatePatientHistoryNote } from './PatientHistoryNote.dto';

class PatientHistoryNoteServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getPatientHistoryNotes(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/patient-history-notes?${filters}` : 'api/patient-history-notes';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching patient history notes:', error);
      throw error;
    }
  }

  async getPatientHistoryNoteById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/patient-history-notes/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching patient history note:', error);
      throw error;
    }
  }

  async getPatientHistoryNotesByPatientHistoryId(patientHistoryId: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/patient-history-notes?patientHistoryId=${patientHistoryId}`);
      return response;
    } catch (error) {
      console.error('Error fetching patient history notes by patient:', error);
      throw error;
    }
  }

  async addPatientHistoryNote(data: IAddPatientHistoryNote): Promise<any> {
    try {
      const response = await this._genericService.post('api/patient-history-notes/add', data);
      return response;
    } catch (error) {
      console.error('Error adding patient history note:', error);
      throw error;
    }
  }

  async updatePatientHistoryNote(data: IUpdatePatientHistoryNote): Promise<any> {
    try {
      const response = await this._genericService.put('api/patient-history-notes/update', data);
      return response;
    } catch (error) {
      console.error('Error updating patient history note:', error);
      throw error;
    }
  }

  async deletePatientHistoryNote(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/patient-history-notes/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting patient history note:', error);
      throw error;
    }
  }
}

export default PatientHistoryNoteServices;
