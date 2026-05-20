import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InventoryList from './pages/InventoryList';
import ComponentForm from './pages/ComponentForm';
import ComponentDetail from './pages/ComponentDetail';
import TransactionForm from './pages/TransactionForm';
import TransactionList from './pages/TransactionList';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import Search from './pages/Search';
import ImportExcel from './pages/ImportExcel';

function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/inventory/new" element={<ComponentForm />} />
            <Route path="/inventory/:id" element={<ComponentDetail />} />
            <Route path="/inventory/:id/edit" element={<ComponentForm />} />
            <Route path="/transactions" element={<TransactionList />} />
            <Route path="/transactions/:type" element={<TransactionForm />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/search" element={<Search />} />
            <Route path="/import" element={<ImportExcel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </HashRouter>
  );
}

export default App;
