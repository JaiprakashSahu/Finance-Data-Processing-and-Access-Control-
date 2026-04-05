import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import IncomeExpenses from './pages/IncomeExpenses';
import AssetsGoals from './pages/AssetsGoals';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/income-expenses" element={<IncomeExpenses />} />
      <Route path="/assets-goals" element={<AssetsGoals />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
