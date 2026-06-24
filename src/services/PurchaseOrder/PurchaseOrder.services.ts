import GenericService from '../g-service';
import type { IAddPurchaseOrder, IUpdatePurchaseOrder } from './PurchaseOrder.dto';

class PurchaseOrderServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getPurchaseOrders(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/purchase-orders?${filters}` : 'api/purchase-orders';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
  }

  async getPurchaseOrderById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/purchase-orders/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      throw error;
    }
  }

  async addPurchaseOrder(data: IAddPurchaseOrder): Promise<any> {
    try {
      const response = await this._genericService.post('api/purchase-orders/add', data);
      return response;
    } catch (error) {
      console.error('Error adding purchase order:', error);
      throw error;
    }
  }

  async updatePurchaseOrder(data: IUpdatePurchaseOrder): Promise<any> {
    try {
      const response = await this._genericService.put('api/purchase-orders/update', data);
      return response;
    } catch (error) {
      console.error('Error updating purchase order:', error);
      throw error;
    }
  }

  async deletePurchaseOrder(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/purchase-orders/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      throw error;
    }
  }

  async bulkDeletePurchaseOrders(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/purchase-orders/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting purchase orders:', error);
      throw error;
    }
  }
}

export default PurchaseOrderServices;
