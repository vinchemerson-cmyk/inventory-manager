import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type {
  AppState,
  ComponentItem,
  Transaction,
  Category,
  Location,
  Supplier,
  AppSettings,
} from '../types';
import { generateId } from '../utils/helpers';
import {
  defaultCategories,
  defaultLocations,
  defaultSuppliers,
  defaultComponents,
  defaultTransactions,
} from '../data/mockData';

const STORAGE_KEY = 'inventory_app_data';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        components: parsed.components ?? [],
        transactions: parsed.transactions ?? [],
        categories: parsed.categories ?? defaultCategories,
        locations: parsed.locations ?? defaultLocations,
        suppliers: parsed.suppliers ?? defaultSuppliers,
        settings: parsed.settings ?? defaultSettings,
      };
    }
  } catch {
    // ignore
  }
  return {
    components: defaultComponents,
    transactions: defaultTransactions,
    categories: defaultCategories,
    locations: defaultLocations,
    suppliers: defaultSuppliers,
    settings: defaultSettings,
  };
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const defaultSettings: AppSettings = {
  lowStockAlertEnabled: true,
  defaultUnit: '个',
  currency: '¥',
  theme: 'light',
};

type Action =
  | { type: 'ADD_COMPONENT'; payload: ComponentItem }
  | { type: 'UPDATE_COMPONENT'; payload: ComponentItem }
  | { type: 'DELETE_COMPONENT'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_LOCATION'; payload: Location }
  | { type: 'UPDATE_LOCATION'; payload: Location }
  | { type: 'DELETE_LOCATION'; payload: string }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'UPDATE_SUPPLIER'; payload: Supplier }
  | { type: 'DELETE_SUPPLIER'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'RESET_DATA' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_COMPONENT':
      return { ...state, components: [...state.components, action.payload] };
    case 'UPDATE_COMPONENT':
      return {
        ...state,
        components: state.components.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_COMPONENT':
      return {
        ...state,
        components: state.components.filter((c) => c.id !== action.payload),
        transactions: state.transactions.filter(
          (t) => t.componentId !== action.payload
        ),
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        components: state.components.map((c) => {
          if (c.id !== action.payload.componentId) return c;
          const newQty =
            action.payload.type === 'in'
              ? c.quantity + action.payload.quantity
              : action.payload.type === 'out'
                ? c.quantity - action.payload.quantity
                : action.payload.quantity;
          return {
            ...c,
            quantity: newQty,
            updatedAt: new Date().toISOString(),
            unitPrice:
              action.payload.type === 'in' && action.payload.unitPrice != null
                ? action.payload.unitPrice
                : c.unitPrice,
          };
        }),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      };
    case 'ADD_LOCATION':
      return { ...state, locations: [...state.locations, action.payload] };
    case 'UPDATE_LOCATION':
      return {
        ...state,
        locations: state.locations.map((l) =>
          l.id === action.payload.id ? action.payload : l
        ),
      };
    case 'DELETE_LOCATION':
      return {
        ...state,
        locations: state.locations.filter((l) => l.id !== action.payload),
      };
    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [...state.suppliers, action.payload] };
    case 'UPDATE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case 'DELETE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.filter((s) => s.id !== action.payload),
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case 'RESET_DATA':
      return {
        components: [],
        transactions: [],
        categories: defaultCategories,
        locations: defaultLocations,
        suppliers: defaultSuppliers,
        settings: defaultSettings,
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addComponent: (comp: Omit<ComponentItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateComponent: (comp: ComponentItem) => void;
  deleteComponent: (id: string) => void;
  addTransaction: (
    txn: Omit<Transaction, 'id' | 'createdAt' | 'remainingStock'>
  ) => void;
  addCategory: (name: string) => Category;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  addLocation: (name: string) => Location;
  updateLocation: (loc: Location) => void;
  deleteLocation: (id: string) => void;
  addSupplier: (name: string) => void;
  updateSupplier: (sup: Supplier) => void;
  deleteSupplier: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addComponent = useCallback(
    (comp: Omit<ComponentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newComp: ComponentItem = {
        ...comp,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_COMPONENT', payload: newComp });
      return newComp;
    },
    [dispatch]
  );

  const updateComponent = useCallback(
    (comp: ComponentItem) => {
      const updated = { ...comp, updatedAt: new Date().toISOString() };
      dispatch({ type: 'UPDATE_COMPONENT', payload: updated });
    },
    [dispatch]
  );

  const deleteComponent = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_COMPONENT', payload: id });
    },
    [dispatch]
  );

  const addTransaction = useCallback(
    (txn: Omit<Transaction, 'id' | 'createdAt' | 'remainingStock'>) => {
      const comp = state.components.find((c) => c.id === txn.componentId);
      if (!comp) return;

      const newQty =
        txn.type === 'in'
          ? comp.quantity + txn.quantity
          : txn.type === 'out'
            ? comp.quantity - txn.quantity
            : txn.quantity;

      const now = new Date().toISOString();
      const newTxn: Transaction = {
        ...txn,
        id: generateId(),
        remainingStock: newQty,
        createdAt: now,
      };
      dispatch({ type: 'ADD_TRANSACTION', payload: newTxn });
    },
    [state.components, dispatch]
  );

  const addCategory = useCallback(
    (name: string) => {
      const newCat: Category = { id: generateId(), name };
      dispatch({ type: 'ADD_CATEGORY', payload: newCat });
      return newCat;
    },
    [dispatch]
  );

  const updateCategory = useCallback(
    (cat: Category) => {
      dispatch({ type: 'UPDATE_CATEGORY', payload: cat });
    },
    [dispatch]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_CATEGORY', payload: id });
    },
    [dispatch]
  );

  const addLocation = useCallback(
    (name: string) => {
      const newLoc: Location = { id: generateId(), name };
      dispatch({ type: 'ADD_LOCATION', payload: newLoc });
      return newLoc;
    },
    [dispatch]
  );

  const updateLocation = useCallback(
    (loc: Location) => {
      dispatch({ type: 'UPDATE_LOCATION', payload: loc });
    },
    [dispatch]
  );

  const deleteLocation = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_LOCATION', payload: id });
    },
    [dispatch]
  );

  const addSupplier = useCallback(
    (name: string) => {
      dispatch({
        type: 'ADD_SUPPLIER',
        payload: { id: generateId(), name },
      });
    },
    [dispatch]
  );

  const updateSupplier = useCallback(
    (sup: Supplier) => {
      dispatch({ type: 'UPDATE_SUPPLIER', payload: sup });
    },
    [dispatch]
  );

  const deleteSupplier = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_SUPPLIER', payload: id });
    },
    [dispatch]
  );

  const updateSettings = useCallback(
    (settings: Partial<AppSettings>) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    },
    [dispatch]
  );

  const exportData = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importData = useCallback(
    (json: string): boolean => {
      try {
        const data = JSON.parse(json);
        if (data.components) {
          dispatch({ type: 'RESET_DATA' });
          data.components.forEach((c: ComponentItem) =>
            dispatch({ type: 'ADD_COMPONENT', payload: c })
          );
          if (data.transactions) {
            data.transactions.forEach((t: Transaction) =>
              dispatch({ type: 'ADD_TRANSACTION', payload: t })
            );
          }
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [dispatch]
  );

  const resetData = useCallback(() => {
    dispatch({ type: 'RESET_DATA' });
  }, [dispatch]);

  const value: AppContextType = {
    state,
    dispatch,
    addComponent,
    updateComponent,
    deleteComponent,
    addTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addLocation,
    updateLocation,
    deleteLocation,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    updateSettings,
    exportData,
    importData,
    resetData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}

export default AppContext;
