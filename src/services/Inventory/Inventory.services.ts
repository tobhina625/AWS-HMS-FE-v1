import GenericService from '../g-service';
import type { IAddInventory, IUpdateInventory, IInventoryTransaction } from './Inventory.interface';

class InventoryServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getInventories(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/inventory?${filters}` : 'api/inventory';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching inventories:', error);
      throw error;
    }
  }

  async getInventoryById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/inventory/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  }

  async addInventory(data: IAddInventory): Promise<any> {
    try {
      const response = await this._genericService.post('api/inventory/add', data);
      return response;
    } catch (error) {
      console.error('Error adding inventory:', error);
      throw error;
    }
  }

  async updateInventory(data: IUpdateInventory): Promise<any> {
    try {
      const response = await this._genericService.put('api/inventory/update', data);
      return response;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  }

  async deleteInventory(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/inventory/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting inventory:', error);
      throw error;
    }
  }

  async bulkDeleteInventory(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/inventory/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting inventory:', error);
      throw error;
    }
  }

  async getInventoryStatistics(): Promise<any> {
    try {
      const response = await this._genericService.get('api/inventory/statistics');
      return response;
    } catch (error) {
      console.error('Error fetching inventory statistics:', error);
      throw error;
    }
  }

  async getLowStockItems(): Promise<any> {
    try {
      const response = await this._genericService.get('api/inventory/low-stock');
      return response;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  }

  async getExpiringItems(days: number = 30): Promise<any> {
    try {
      const response = await this._genericService.get(`api/inventory/expiring?days=${days}`);
      return response;
    } catch (error) {
      console.error('Error fetching expiring items:', error);
      throw error;
    }
  }

  async adjustStock(inventoryId: number, quantity: number, reason: string): Promise<any> {
    try {
      const response = await this._genericService.post('api/inventory/adjust-stock', {
        inventoryId,
        quantity,
        reason,
      });
      return response;
    } catch (error) {
      console.error('Error adjusting stock:', error);
      throw error;
    }
  }

  async getInventoryTransactions(inventoryId: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/inventory/${inventoryId}/transactions`);
      return response;
    } catch (error) {
      console.error('Error fetching inventory transactions:', error);
      throw error;
    }
  }

  async addTransaction(inventoryId: number, data: IInventoryTransaction): Promise<any> {
    try {
      const response = await this._genericService.post(`api/inventory/${inventoryId}/transactions`, data);
      return response;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  async getRecentTransactions(count: number = 50): Promise<any> {
    try {
      const response = await this._genericService.get(`api/inventory/transactions/recent?count=${count}`);
      return response;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await this._genericService.get(`api/inventory/transactions/date-range?startDate=${startDate}&endDate=${endDate}`);
      return response;
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      throw error;
    }
  }

  async getInventoryByItemType(type: string, page: number = 0, size: number = 10): Promise<any> {
    try {
      const response = await this._genericService.get(`api/inventory/by-item-type?type=${type}&page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('Error fetching inventory by item type:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryServices();
