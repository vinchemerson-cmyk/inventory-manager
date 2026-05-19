import type { ComponentItem, DashboardStats } from '../types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}-${day}`;
}

export function formatMonth(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function calcDashboardStats(
  components: ComponentItem[]
): DashboardStats {
  const componentTypes = components.length;
  const totalQuantity = components.reduce((sum, c) => sum + c.quantity, 0);
  const totalValue = components.reduce((sum, c) => sum + c.quantity * c.unitPrice, 0);
  const lowStockCount = components.filter((c) => c.quantity <= c.safeStock).length;

  return { componentTypes, totalQuantity, totalValue, lowStockCount };
}

export function formatCurrency(value: number, currency: string = '¥'): string {
  if (value >= 10000) {
    return `${currency}${(value / 10000).toFixed(2)}万`;
  }
  if (Number.isInteger(value)) {
    return `${currency}${value.toLocaleString()}`;
  }
  return `${currency}${value.toFixed(2)}`;
}

export function getComponentById(
  components: ComponentItem[],
  id: string
): ComponentItem | undefined {
  return components.find((c) => c.id === id);
}

export function getCategoryName(
  categories: { id: string; name: string }[],
  id: string
): string {
  const cat = categories.find((c) => c.id === id);
  return cat?.name ?? '未分类';
}

export function getLocationName(
  locations: { id: string; name: string }[],
  id: string
): string {
  const loc = locations.find((l) => l.id === id);
  return loc?.name ?? '未指定';
}

export function getSupplierName(
  suppliers: { id: string; name: string }[],
  id?: string
): string {
  if (!id) return '';
  const sup = suppliers.find((s) => s.id === id);
  return sup?.name ?? '';
}
