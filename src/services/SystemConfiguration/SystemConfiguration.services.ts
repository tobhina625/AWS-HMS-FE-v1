import GService from '../g-service';

export interface SystemConfigurationDto {
  id: number;
  key: string;
  value: string;
  description?: string;
  category?: string;
  isEditable: boolean;
}

export interface CreateSystemConfigurationDto {
  key: string;
  value: string;
  description?: string;
  category?: string;
  isEditable: boolean;
}

class SystemConfigurationService extends GService {
  async getAllConfigurations() {
    return this.get('api/system-configuration');
  }

  async getByKey(key: string) {
    return this.get(`api/system-configuration/key/${key}`);
  }

  async getByCategory(category: string) {
    return this.get(`api/system-configuration/category/${category}`);
  }

  async addConfiguration(config: CreateSystemConfigurationDto) {
    return this.post('api/system-configuration/add', config);
  }

  async updateConfiguration(key: string, value: string, description?: string) {
    return this.put(`api/system-configuration/update/${key}`, { value, description });
  }

  async deleteConfiguration(id: number) {
    return this.delete(`api/system-configuration/delete/${id}`);
  }
}

export default new SystemConfigurationService();
