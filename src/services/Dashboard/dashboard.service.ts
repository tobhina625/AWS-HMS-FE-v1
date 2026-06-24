import GenericService from '../g-service';

class DashboardService {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getDashboardStats(): Promise<any> {
    try {
      const response = await this._genericService.get('api/dashboard/stats');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getFinancialOverview(year?: number): Promise<any> {
    try {
      const url = year ? `api/dashboard/financial-overview?year=${year}` : 'api/dashboard/financial-overview';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching financial overview:', error);
      throw error;
    }
  }

  async getAppointmentOverview(period?: 'monthly' | 'yearly'): Promise<any> {
    try {
      const url = period ? `api/dashboard/appointment-overview?period=${period}` : 'api/dashboard/appointment-overview';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching appointment overview:', error);
      throw error;
    }
  }

  async getDashboardByRole(): Promise<any> {
    try {
      const response = await this._genericService.get('api/dashboard/by-role');
      return response;
    } catch (error) {
      console.error('Error fetching role-based dashboard:', error);
      throw error;
    }
  }
}

export default DashboardService;
