import GenericService from '../g-service';

class InvoiceService {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getInvoices(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/invoices?${filters}` : 'api/invoices';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async getInvoiceById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/invoices/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  async getInvoiceSummary(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/invoices/summary?${filters}` : 'api/invoices/summary';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching invoice summary:', error);
      throw error;
    }
  }

  async getInvoicesByPatientId(patientId: number, page: number = 0, size: number = 10): Promise<any> {
    try {
      const response = await this._genericService.get('api/invoices/by-patient', `id=${patientId}&page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('Error fetching invoices by patient:', error);
      throw error;
    }
  }

  async createInvoice(data: IAddInvoice): Promise<any> {
    try {
      const response = await this._genericService.post('api/invoices', data);
      return response;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async issueInvoice(id: number): Promise<any> {
    try {
      const response = await this._genericService.put(`api/invoices/${id}/issue`, {});
      return response;
    } catch (error) {
      console.error('Error issuing invoice:', error);
      throw error;
    }
  }

  async voidInvoice(id: number, reason: string): Promise<any> {
    try {
      const response = await this._genericService.put(`api/invoices/${id}/void`, { cancellationReason: reason });
      return response;
    } catch (error) {
      console.error('Error voiding invoice:', error);
      throw error;
    }
  }

  async recordPayment(invoiceId: number, data: { amount: number; paymentMethod: number; referenceNumber?: string; notes?: string }): Promise<any> {
    try {
      const response = await this._genericService.post(`api/invoices/${invoiceId}/payments`, data);
      return response;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  async recordRefund(invoiceId: number, data: { amount: number; reason: string; paymentId?: number }): Promise<any> {
    try {
      const response = await this._genericService.post(`api/invoices/${invoiceId}/refunds`, data);
      return response;
    } catch (error) {
      console.error('Error recording refund:', error);
      throw error;
    }
  }

  async getInvoiceAuditLogs(invoiceId: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/invoices/${invoiceId}/audit-logs`);
      return response;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }
}

export default InvoiceService;
