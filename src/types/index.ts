export interface Category {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
}

export interface ComponentItem {
  id: string;
  name: string;
  model: string;
  package: string;
  brand: string;
  categoryId: string;
  quantity: number;
  unit: string;
  safeStock: number;
  locationId: string;
  description: string;
  datasheetUrl: string;
  tags: string[];
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'in' | 'out' | 'adjust';
export type OutType = 'project_use' | 'scrap' | 'giveaway';

export interface Transaction {
  id: string;
  componentId: string;
  type: TransactionType;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  supplierId?: string;
  projectName?: string;
  outType?: OutType;
  date: string;
  note: string;
  operator: string;
  remainingStock: number;
  createdAt: string;
}

export interface AppSettings {
  lowStockAlertEnabled: boolean;
  defaultUnit: string;
  currency: string;
  theme: 'light' | 'dark';
}

export interface AppState {
  components: ComponentItem[];
  transactions: Transaction[];
  categories: Category[];
  locations: Location[];
  suppliers: Supplier[];
  settings: AppSettings;
}

export interface DashboardStats {
  componentTypes: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
}
