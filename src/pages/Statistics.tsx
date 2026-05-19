import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { formatCurrency, getCategoryName } from '../utils/helpers';
import { NavBar } from '../components';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ArrowDownToLine, ArrowUpFromLine, Layers } from 'lucide-react';
import type { Transaction } from '../types';
import './Statistics.css';

type TimeRange = 'month' | 'quarter' | 'year';

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#84cc16', '#6366f1'];

function getTimeRangeDates(range: TimeRange): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  let start: Date;
  switch (range) {
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
  }
  return { start, end };
}

function filterTransactionsByRange(transactions: Transaction[], range: TimeRange): Transaction[] {
  const { start, end } = getTimeRangeDates(range);
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= start && d <= end;
  });
}

const TIME_RANGE_LABELS: { value: TimeRange; label: string }[] = [
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '近三月' },
  { value: 'year', label: '今年' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="statistics-chart-tooltip">
      <p className="statistics-chart-tooltip-label">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="statistics-chart-tooltip-item" style={{ color: entry.color }}>
          {entry.name}: {entry.value != null ? String(entry.value) : ''}
        </p>
      ))}
    </div>
  );
};

const CurrencyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="statistics-chart-tooltip">
      <p className="statistics-chart-tooltip-label">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="statistics-chart-tooltip-item" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function Statistics() {
  const { state } = useApp();
  const { components, transactions, categories } = state;
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const filteredTransactions = useMemo(
    () => filterTransactionsByRange(transactions, timeRange),
    [transactions, timeRange]
  );

  const summaryStats = useMemo(() => {
    const totalIn = filteredTransactions
      .filter((t) => t.type === 'in')
      .reduce((sum, t) => sum + t.quantity, 0);
    const totalOut = filteredTransactions
      .filter((t) => t.type === 'out')
      .reduce((sum, t) => sum + t.quantity, 0);
    const currentStock = components.reduce((sum, c) => sum + c.quantity, 0);
    return { totalIn, totalOut, currentStock };
  }, [filteredTransactions, components]);

  const categoryPieData = useMemo(() => {
    const map = new Map<string, number>();
    components.forEach((c) => {
      const name = getCategoryName(categories, c.categoryId);
      map.set(name, (map.get(name) || 0) + c.quantity);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [components, categories]);

  const categoryValueData = useMemo(() => {
    const map = new Map<string, number>();
    components.forEach((c) => {
      const name = getCategoryName(categories, c.categoryId);
      map.set(name, (map.get(name) || 0) + c.quantity * c.unitPrice);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [components, categories]);

  const purchaseTrendData = useMemo(() => {
    const map = new Map<string, { quantity: number; cost: number }>();
    filteredTransactions
      .filter((t) => t.type === 'in')
      .forEach((t) => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const existing = map.get(key) || { quantity: 0, cost: 0 };
        existing.quantity += t.quantity;
        existing.cost += t.totalPrice ?? 0;
        map.set(key, existing);
      });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        采购数量: data.quantity,
        采购金额: data.cost,
      }));
  }, [filteredTransactions]);

  const consumptionTrendData = useMemo(() => {
    const map = new Map<string, { quantity: number; cost: number }>();
    filteredTransactions
      .filter((t) => t.type === 'out')
      .forEach((t) => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const existing = map.get(key) || { quantity: 0, cost: 0 };
        existing.quantity += t.quantity;
        existing.cost += t.totalPrice ?? 0;
        map.set(key, existing);
      });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        消耗数量: data.quantity,
        消耗金额: data.cost,
      }));
  }, [filteredTransactions]);

  const topComponentsData = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'out')
      .forEach((t) => {
        const comp = components.find((c) => c.id === t.componentId);
        if (comp) {
          const key = `${comp.name} ${comp.model}`;
          map.set(key, (map.get(key) || 0) + t.quantity);
        }
      });

    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }))
      .reverse();
  }, [transactions, components]);

  const pieColors = COLORS.slice(0, categoryPieData.length);

  const summaryCards = [
    {
      label: '累计入库总数',
      value: summaryStats.totalIn,
      icon: ArrowDownToLine,
      color: '#16a34a',
      bg: '#f0fdf4',
    },
    {
      label: '累计出库总数',
      value: summaryStats.totalOut,
      icon: ArrowUpFromLine,
      color: '#dc2626',
      bg: '#fef2f2',
    },
    {
      label: '当前库存总量',
      value: summaryStats.currentStock,
      icon: Layers,
      color: '#2563eb',
      bg: '#eff6ff',
    },
  ];

  return (
    <div className="statistics-page">
      <NavBar title="统计分析" />

      <div className="statistics-page__content">
        <div className="statistics-time-range">
          {TIME_RANGE_LABELS.map((item) => (
            <button
              key={item.value}
              className={`statistics-time-range__btn ${timeRange === item.value ? 'statistics-time-range__btn--active' : ''}`}
              onClick={() => setTimeRange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="statistics-summary">
          {summaryCards.map((card, i) => (
            <div key={i} className="statistics-summary-card">
              <div className="statistics-summary-card__icon" style={{ backgroundColor: card.bg, color: card.color }}>
                <card.icon size={24} />
              </div>
              <div className="statistics-summary-card__info">
                <span className="statistics-summary-card__label">{card.label}</span>
                <span className="statistics-summary-card__value">{card.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="statistics-charts">
          <div className="statistics-charts__row">
            <div className="statistics-chart-card">
              <h3 className="statistics-chart-card__title">库存分类占比</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {categoryPieData.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="statistics-chart-card">
              <h3 className="statistics-chart-card__title">库存价值分布</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryValueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CurrencyTooltip />} />
                  <Bar dataKey="value" name="总价值" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="statistics-charts__row">
            <div className="statistics-chart-card">
              <h3 className="statistics-chart-card__title">采购趋势图</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={purchaseTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="采购数量" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="采购金额" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="statistics-chart-card">
              <h3 className="statistics-chart-card__title">消耗趋势图</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={consumptionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="消耗数量" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="消耗金额" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="statistics-charts__row">
            <div className="statistics-chart-card statistics-chart-card--full">
              <h3 className="statistics-chart-card__title">常用元器件 Top 10</h3>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={topComponentsData} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="总出库数量" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
