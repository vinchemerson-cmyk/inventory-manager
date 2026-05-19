import type { ComponentItem, Transaction, Category, Location, Supplier } from '../types';
import {
  formatDate,
  getCategoryName,
  getLocationName,
  getSupplierName,
} from './helpers';

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportComponentsCSV(
  components: ComponentItem[],
  categories: Category[],
  locations: Location[]
): string {
  const headers = [
    '名称',
    '型号',
    '封装',
    '品牌',
    '分类',
    '库存数量',
    '单位',
    '安全库存',
    '存放位置',
    '单价',
    '库存价值',
    '标签',
    '描述',
    '创建时间',
    '更新时间',
  ];
  const rows = components.map((c) => [
    escapeCSV(c.name),
    escapeCSV(c.model),
    escapeCSV(c.package),
    escapeCSV(c.brand),
    escapeCSV(getCategoryName(categories, c.categoryId)),
    String(c.quantity),
    escapeCSV(c.unit),
    String(c.safeStock),
    escapeCSV(getLocationName(locations, c.locationId)),
    String(c.unitPrice),
    String(c.quantity * c.unitPrice),
    escapeCSV(c.tags.join(';')),
    escapeCSV(c.description),
    formatDate(c.createdAt),
    formatDate(c.updatedAt),
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function exportTransactionsCSV(
  transactions: Transaction[],
  components: ComponentItem[],
  suppliers: Supplier[]
): string {
  const headers = [
    '日期',
    '类型',
    '元器件名称',
    '元器件型号',
    '数量变化',
    '单价',
    '总价',
    '供应商',
    '剩余库存',
    '备注',
    '操作人',
  ];
  const rows = transactions.map((t) => {
    const comp = components.find((c) => c.id === t.componentId);
    const typeLabel =
      t.type === 'in' ? '入库' : t.type === 'out' ? '出库' : '调整';
    return [
      t.date,
      typeLabel,
      escapeCSV(comp?.name ?? ''),
      escapeCSV(comp?.model ?? ''),
      String(t.type === 'out' ? -t.quantity : t.quantity),
      t.unitPrice != null ? String(t.unitPrice) : '',
      t.totalPrice != null ? String(t.totalPrice) : '',
      escapeCSV(getSupplierName(suppliers, t.supplierId)),
      String(t.remainingStock),
      escapeCSV(t.note),
      escapeCSV(t.operator),
    ];
  });
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
