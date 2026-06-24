export interface IDepartment {
  id: number;
  name?: string;
}

export interface IInventory {
  id: number;
  name: string;
  description: string;
  sku?: string;
  barcode?: string;
  quantity: number;
  minimumStockLevel: number;
  reorderLevel: number;
  maximumStockLevel: number;
  cost: number;
  price: number;
  itemType: string;
  category: string;
  status: string;
  location?: string;
  storageConditions?: string;
  manufacturer?: string;
  supplierName?: string;
  supplierContact?: string;
  manufactureDate?: string;
  expiryDate?: string;
  batchNumber?: string;
  requiresPrescription: boolean;
  isTemperatureControlled: boolean;
  isHazardous: boolean;
  notes?: string;
  lastRestockedDate?: string;
  department?: IDepartment;
  isLowStock: boolean;
  needsReorder: boolean;
  isExpiringSoon: boolean;
  isExpired: boolean;
  daysUntilExpiry: number;
  stockPercentage: number;
  totalValue: number;
}

export interface IAddInventory {
  name: string;
  description: string;
  sku?: string;
  barcode?: string;
  quantity: number;
  minimumStockLevel: number;
  reorderLevel: number;
  maximumStockLevel: number;
  cost: number;
  price: number;
  itemType: string;
  category: string;
  status: string;
  location?: string;
  storageConditions?: string;
  manufacturer?: string;
  supplierName?: string;
  supplierContact?: string;
  manufactureDate?: string;
  expiryDate?: string;
  batchNumber?: string;
  requiresPrescription: boolean;
  isTemperatureControlled: boolean;
  isHazardous: boolean;
  notes?: string;
  departmentId?: number;
}

export interface IUpdateInventory extends IAddInventory {
  id: number;
}

export interface IInventoryTransaction {
  id: number;
  inventoryId: number;
  inventoryName: string;
  type: string;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  unitCost?: number;
  totalCost?: number;
  transactionDate: string;
  referenceNumber?: string;
  reason?: string;
  notes?: string;
  performedByEmployeeId?: number;
  performedByName?: string;
  departmentId?: number;
  departmentName?: string;
  vendorId?: number;
  vendorName?: string;
}

export interface IInventoryStatistics {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  expiringCount: number;
  outOfStockCount: number;
  statusBreakdown: Array<{ status: string; count: number }>;
  categoryBreakdown: Array<{ category: string; count: number; totalValue: number }>;
  lowStockItems: IInventory[];
  expiringItems: IInventory[];
}
