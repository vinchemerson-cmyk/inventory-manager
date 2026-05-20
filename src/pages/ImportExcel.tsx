import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../store/AppContext';
import { NavBar } from '../components';
import type { ComponentItem } from '../types';
import './ImportExcel.css';

type FieldKey =
  | 'name'
  | 'model'
  | 'package'
  | 'brand'
  | 'categoryId'
  | 'quantity'
  | 'unit'
  | 'unitPrice'
  | 'locationId'
  | 'safeStock'
  | 'description';

interface FieldOption {
  key: FieldKey | '__skip__';
  label: string;
}

const FIELD_OPTIONS: FieldOption[] = [
  { key: 'name', label: '名称(name)' },
  { key: 'model', label: '型号(model)' },
  { key: 'package', label: '封装(package)' },
  { key: 'brand', label: '品牌(brand)' },
  { key: 'categoryId', label: '分类(categoryId)' },
  { key: 'quantity', label: '数量(quantity)' },
  { key: 'unit', label: '单位(unit)' },
  { key: 'unitPrice', label: '单价(unitPrice)' },
  { key: 'locationId', label: '存放位置(locationId)' },
  { key: 'safeStock', label: '安全库存(safeStock)' },
  { key: 'description', label: '备注(description)' },
  { key: '__skip__', label: '不导入' },
];

const AUTO_DETECT_KEYWORDS: Record<FieldKey, string[]> = {
  name: ['名称', 'name', '品名', '元件名称', '物料名称'],
  model: ['型号', 'model', '规格型号', '规格', 'spec'],
  package: ['封装', 'package', '封装形式', 'pkg', '封装类型'],
  brand: ['品牌', 'brand', '厂商', 'manufacturer', '生产商'],
  categoryId: ['分类', 'category', '类别', '种类', '类型'],
  quantity: ['数量', 'quantity', 'qty', '库存', '库存数量'],
  unit: ['单位', 'unit', '计量单位', '量纲'],
  unitPrice: ['单价', 'price', 'unitprice', 'unit_price', '价格', '售价'],
  locationId: ['存放位置', 'location', '位置', '库位', '仓库', '存放'],
  safeStock: ['安全库存', 'safestock', 'safe_stock', '最低库存', '最小库存'],
  description: ['备注', 'description', 'note', '描述', '说明', '注释'],
};

function autoDetectMapping(headers: string[]): Record<FieldKey, number> {
  const mapping: Record<FieldKey, number> = {} as Record<FieldKey, number>;
  const lowerHeaders = headers.map((h) => h.trim().toLowerCase());

  const fields: FieldKey[] = [
    'name', 'model', 'package', 'brand', 'categoryId',
    'quantity', 'unit', 'unitPrice', 'locationId', 'safeStock', 'description',
  ];

  const assignedCols = new Set<number>();

  for (const field of fields) {
    const keywords = AUTO_DETECT_KEYWORDS[field];
    for (let colIdx = 0; colIdx < lowerHeaders.length; colIdx++) {
      if (assignedCols.has(colIdx)) continue;
      const header = lowerHeaders[colIdx];
      if (keywords.some((kw) => header === kw.toLowerCase())) {
        mapping[field] = colIdx;
        assignedCols.add(colIdx);
        break;
      }
    }
  }

  for (const field of fields) {
    if (mapping[field] !== undefined) continue;
    const keywords = AUTO_DETECT_KEYWORDS[field];
    for (let colIdx = 0; colIdx < lowerHeaders.length; colIdx++) {
      if (assignedCols.has(colIdx)) continue;
      const header = lowerHeaders[colIdx];
      if (keywords.some((kw) => header.includes(kw.toLowerCase()))) {
        mapping[field] = colIdx;
        assignedCols.add(colIdx);
        break;
      }
    }
  }

  for (const field of fields) {
    if (mapping[field] !== undefined) continue;
    mapping[field] = -1;
  }

  return mapping;
}

function getMappedValue(
  row: string[],
  colIndex: number,
  defaultValue: string = '',
): string {
  if (colIndex < 0 || colIndex >= row.length) return defaultValue;
  const val = row[colIndex];
  return val != null ? String(val).trim() : defaultValue;
}

export default function ImportExcel() {
  const {
    state,
    addComponent,
    addCategory,
    addLocation,
    addBrand,
    addPackage,
  } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<FieldKey, number> | null>(null);
  const [autoCreate, setAutoCreate] = useState(true);
  const [skipExisting, setSkipExisting] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    skipped: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState('');

  const resetData = useCallback(() => {
    setFileName('');
    setSheetName('');
    setHeaders([]);
    setRows([]);
    setMapping(null);
    setImportResult(null);
    setError('');
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      resetData();

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
        setError('不支持的文件格式，请选择 .xlsx / .xls / .csv 文件');
        return;
      }

      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            setError('文件读取失败');
            return;
          }

          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            setError('未找到工作表');
            return;
          }

          const sheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, {
            header: 1,
            defval: '',
            blankrows: false,
          });

          if (jsonData.length === 0) {
            setError('工作表中没有数据');
            return;
          }

          const headerRow = jsonData[0] as string[];
          const dataRows = jsonData.slice(1) as string[][];

          const validHeaders = headerRow.map((h) => String(h ?? ''));
          const validRows = dataRows.filter(
            (row) => row.some((cell) => String(cell ?? '').trim() !== ''),
          );

          if (validRows.length === 0) {
            setError('工作表中没有有效数据行');
            return;
          }

          setSheetName(firstSheetName);
          setHeaders(validHeaders);
          setRows(validRows);

          const detectedMapping = autoDetectMapping(validHeaders);
          setMapping(detectedMapping);
        } catch {
          setError('文件解析失败，请检查文件格式');
        }
      };

      reader.onerror = () => {
        setError('文件读取失败');
      };

      reader.readAsArrayBuffer(file);
    },
    [resetData],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleMappingChange = (headerIdx: number, fieldKey: string) => {
    if (!mapping) return;
    const newMapping = { ...mapping };

    const fields = Object.keys(newMapping) as FieldKey[];
    for (const f of fields) {
      if (newMapping[f] === headerIdx) {
        newMapping[f] = -1;
      }
    }

    if (fieldKey !== '__skip__') {
      newMapping[fieldKey as FieldKey] = headerIdx;
    }

    setMapping(newMapping);
  };

  const isHeaderMapped = (headerIdx: number): boolean => {
    if (!mapping) return false;
    const fields = Object.keys(mapping) as FieldKey[];
    return fields.some((f) => mapping[f] === headerIdx);
  };

  const handleImport = async () => {
    if (!mapping || rows.length === 0) return;
    if (mapping.name < 0) {
      setError('请至少将"名称"字段映射到一列');
      return;
    }

    setImporting(true);
    setError('');
    setImportResult(null);

    let successCount = 0;
    let skippedCount = 0;

    const existingNames = new Set(
      state.components.map((c) => c.name.toLowerCase().trim()),
    );

    const getCategoryId = (name: string): string => {
      const found = state.categories.find(
        (c) => c.name.toLowerCase() === name.toLowerCase(),
      );
      if (found) return found.id;
      if (autoCreate) {
        const cat = addCategory(name);
        return cat.id;
      }
      return state.categories[0]?.id ?? '';
    };

    const getLocationId = (name: string): string => {
      if (!name) return state.locations[0]?.id ?? '';
      const found = state.locations.find(
        (l) => l.name.toLowerCase() === name.toLowerCase(),
      );
      if (found) return found.id;
      if (autoCreate) {
        const loc = addLocation(name);
        return loc.id;
      }
      return state.locations[0]?.id ?? '';
    };

    const getOrCreateBrand = (name: string): string => {
      if (!name) return '';
      const existingBrands = state.brands as { id: string; name: string }[];
      const found = existingBrands.find(
        (b) => b.name.toLowerCase() === name.toLowerCase(),
      );
      if (found) return found.name;
      if (autoCreate) {
        addBrand(name);
        return name;
      }
      return name;
    };

    const getOrCreatePackage = (name: string): string => {
      if (!name) return '';
      const existingPackages = state.packages as { id: string; name: string }[];
      const found = existingPackages.find(
        (p) => p.name.toLowerCase() === name.toLowerCase(),
      );
      if (found) return found.name;
      if (autoCreate) {
        addPackage(name);
        return name;
      }
      return name;
    };

    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const componentName = getMappedValue(row, mapping.name);

        if (!componentName) {
          skippedCount++;
          continue;
        }

        if (skipExisting && existingNames.has(componentName.toLowerCase())) {
          skippedCount++;
          continue;
        }

        const categoryName = getMappedValue(
          row,
          mapping.categoryId,
          state.categories[0]?.name ?? '',
        );
        const locationName = getMappedValue(
          row,
          mapping.locationId,
          state.locations[0]?.name ?? '',
        );
        const brandName = getMappedValue(row, mapping.brand);
        const packageName = getMappedValue(row, mapping.package);

        const categoryId = getCategoryId(categoryName);
        const locationId = getLocationId(locationName);
        const brand = getOrCreateBrand(brandName);
        const pkg = getOrCreatePackage(packageName);

        const quantityStr = getMappedValue(row, mapping.quantity, '0');
        const quantity = parseFloat(quantityStr) || 0;

        const unitPriceStr = getMappedValue(row, mapping.unitPrice, '0');
        const unitPrice = parseFloat(unitPriceStr) || 0;

        const safeStockStr = getMappedValue(row, mapping.safeStock, '0');
        const safeStock = parseFloat(safeStockStr) || 0;

        const unit = getMappedValue(row, mapping.unit, '个');
        const model = getMappedValue(row, mapping.model);
        const description = getMappedValue(row, mapping.description);

        const compData: Omit<ComponentItem, 'id' | 'createdAt' | 'updatedAt'> = {
          name: componentName,
          model,
          package: pkg,
          brand,
          categoryId,
          quantity,
          unit,
          safeStock,
          locationId,
          unitPrice,
          description,
          datasheetUrl: '',
          tags: [],
        };

        addComponent(compData);
        successCount++;
      }

      setImportResult({
        success: successCount,
        skipped: skippedCount,
        total: rows.length,
      });
    } catch {
      setError('导入过程中出现错误');
    } finally {
      setImporting(false);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const hasData = headers.length > 0 && rows.length > 0;

  return (
    <div className="import-excel">
      <NavBar
        title="Excel 导入"
        showBack
        backTo="/inventory"
      />

      <div className="import-content">
        {error && (
          <div className="import-error">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button
              className="import-error-dismiss"
              onClick={() => setError('')}
            >
              ×
            </button>
          </div>
        )}

        {importResult && (
          <div className="import-success">
            <CheckCircle2 size={18} />
            <span>
              成功导入 {importResult.success} 条元器件
              {importResult.skipped > 0 &&
                `，跳过 ${importResult.skipped} 条`}
            </span>
            <button
              className="import-success-dismiss"
              onClick={() => setImportResult(null)}
            >
              ×
            </button>
          </div>
        )}

        <div
          className={`import-upload-area ${hasData ? 'import-upload-area-collapsed' : ''}`}
          onClick={handleUploadAreaClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="import-file-input"
            onChange={handleFileChange}
          />
          {hasData ? (
            <div className="import-upload-summary">
              <FileSpreadsheet size={20} color="#3b82f6" />
              <span className="import-upload-filename">{fileName}</span>
              <button
                className="import-upload-change"
                onClick={(e) => {
                  e.stopPropagation();
                  resetData();
                }}
              >
                更换文件
              </button>
            </div>
          ) : (
            <>
              <Upload size={32} color="#3b82f6" />
              <p className="import-upload-text">点击或拖拽上传 Excel/CSV 文件</p>
              <p className="import-upload-hint">支持 .xlsx / .xls / .csv 格式</p>
            </>
          )}
        </div>

        {hasData && (
          <>
            <div className="import-info-card">
              <div className="import-info-row">
                <span className="import-info-label">工作表</span>
                <span className="import-info-value">{sheetName}</span>
              </div>
              <div className="import-info-row">
                <span className="import-info-label">数据行数</span>
                <span className="import-info-value">{rows.length} 行</span>
              </div>
              <div className="import-info-row">
                <span className="import-info-label">列数</span>
                <span className="import-info-value">{headers.length} 列</span>
              </div>
            </div>

            <div className="import-section">
              <div className="import-section-header">
                <h3 className="import-section-title">列映射</h3>
              </div>
              <div className="import-mapping-table-wrap">
                <table className="import-mapping-table">
                  <thead>
                    <tr>
                      <th className="import-mapping-th">序号</th>
                      <th className="import-mapping-th">Excel 列名</th>
                      <th className="import-mapping-th">→ 映射到字段</th>
                    </tr>
                  </thead>
                  <tbody>
                    {headers.map((header, idx) => (
                      <tr key={idx} className={isHeaderMapped(idx) ? 'import-mapping-row-mapped' : ''}>
                        <td className="import-mapping-td import-mapping-td-index">
                          {idx + 1}
                        </td>
                        <td className="import-mapping-td import-mapping-td-header">
                          {header || `列${idx + 1}`}
                        </td>
                        <td className="import-mapping-td">
                          <select
                            className="import-mapping-select"
                            value={
                              (() => {
                                if (!mapping) return '__skip__';
                                const fields = Object.keys(mapping) as FieldKey[];
                                for (const f of fields) {
                                  if (mapping[f] === idx) return f;
                                }
                                return '__skip__';
                              })()
                            }
                            onChange={(e) =>
                              handleMappingChange(idx, e.target.value)
                            }
                          >
                            {FIELD_OPTIONS.map((opt) => (
                              <option key={opt.key} value={opt.key}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="import-section">
              <div className="import-section-header">
                <h3 className="import-section-title">
                  数据预览（前 10 行）
                </h3>
              </div>
              <div className="import-preview-table-wrap">
                <table className="import-preview-table">
                  <thead>
                    <tr>
                      <th className="import-preview-th">#</th>
                      {Object.keys(mapping ?? {}).map((field) => {
                        if ((mapping?.[field as FieldKey] ?? -1) < 0) return null;
                        const opt = FIELD_OPTIONS.find((o) => o.key === field);
                        return (
                          <th key={field} className="import-preview-th">
                            {opt?.label ?? field}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 10).map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        <td className="import-preview-td import-preview-td-index">
                          {rowIdx + 1}
                        </td>
                        {Object.keys(mapping ?? {}).map((field) => {
                          const colIdx = mapping?.[field as FieldKey] ?? -1;
                          if (colIdx < 0) return null;
                          return (
                            <td key={field} className="import-preview-td">
                              {getMappedValue(row, colIdx) || '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="import-section">
              <div className="import-section-header">
                <h3 className="import-section-title">导入选项</h3>
              </div>
              <div className="import-options-body">
                <label className="import-option">
                  <input
                    type="checkbox"
                    className="import-checkbox"
                    checked={autoCreate}
                    onChange={(e) => setAutoCreate(e.target.checked)}
                  />
                  <span className="import-option-text">
                    自动创建不存在的分类/品牌/封装
                  </span>
                </label>
                <label className="import-option">
                  <input
                    type="checkbox"
                    className="import-checkbox"
                    checked={skipExisting}
                    onChange={(e) => setSkipExisting(e.target.checked)}
                  />
                  <span className="import-option-text">
                    跳过已存在的元器件(按名称判断)
                  </span>
                </label>
              </div>
            </div>

            <div className="import-action">
              <button
                className="import-btn"
                disabled={importing}
                onClick={handleImport}
              >
                {importing ? '导入中...' : `批量导入 ${rows.length} 条`}
              </button>
            </div>

            {!mapping?.name || mapping.name < 0 ? (
              <p className="import-warning">
                <AlertCircle size={14} />
                请先在列映射中将"名称"字段关联到 Excel 中的对应列
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
