export interface IPurchaseOrderDetails {
  id: number;
  price: number;
  quantity: number;
  inventoryId: number;
  inventory?: {
    id: number;
    name: string;
  };
  purchaseOrderId: number;
}

export interface IPurchaseOrder {
  id: number;
  orderDate: string;
  totalAmount: number;
  isConfirmed: boolean;
  vendorId: number;
  vendor?: {
    id: number;
    companyName: string;
  };
  purchaseOrderDetails?: IPurchaseOrderDetails[];
}

export interface IAddPurchaseOrder {
  orderDate: string;
  totalAmount: number;
  isConfirmed: boolean;
  vendorId: number;
}

export interface IUpdatePurchaseOrder extends IAddPurchaseOrder {
  id: number;
}
