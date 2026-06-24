import GenericService from '../g-service';
import type { IModuleCreate, IModuleUpdate } from './Module.interface';

class ModuleServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getAllModules(page?: number, size?: number, sort?: string): Promise<any> {
    try {
      let url = 'api/module';
      const params = new URLSearchParams();

      if (page !== undefined) params.append('page', page.toString());
      if (size !== undefined) params.append('size', size.toString());
      if (sort) params.append('sort', sort);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  }

  async getModuleById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/module/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  }

  async addModule(data: IModuleCreate): Promise<any> {
    try {
      const response = await this._genericService.post('api/module/add', data);
      return response;
    } catch (error) {
      console.error('Error adding module:', error);
      throw error;
    }
  }

  async updateModule(data: IModuleUpdate): Promise<any> {
    try {
      const response = await this._genericService.put('api/module/update', data);
      return response;
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  }

  async deleteModule(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/module/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  }
}

export default ModuleServices;
