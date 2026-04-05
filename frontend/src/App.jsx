import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RequireAdmin, RedirectIfAuth, RequireAuth } from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import TradingPage from "./pages/TradingPage";
import PlatformsPage from "./pages/PlatformsPage";
import PromotionsPage from "./pages/PromotionsPage";
import PartnersPage from "./pages/PartnersPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminKYC from "./pages/admin/AdminKYC";
import { AdminMarkets, AdminSettings } from "./pages/admin/AdminMarketsAndSettings";

import DashboardLayout from "./pages/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import AccountManagement from "./pages/dashboard/AccountManagement";
import DepositWithdraw from "./pages/dashboard/DepositWithdraw";
import InternalTransfer from "./pages/dashboard/InternalTransfer";
import KYCSection from "./pages/dashboard/KYCSection";
import CopyTradingPage from "./pages/dashboard/CopyTradingPage";
import TerminalPage from "./pages/TerminalPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trading" element={<TradingPage />} />
          <Route path="/platforms" element={<PlatformsPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />
          <Route path="/trading-terminal" element={<RequireAuth><TerminalPage /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            <Route index element={<DashboardHome />} />
            <Route path="accounts" element={<AccountManagement />} />
            <Route path="funds" element={<DepositWithdraw />} />
            <Route path="transfer" element={<InternalTransfer />} />
            <Route path="kyc" element={<KYCSection />} />
            <Route path="copy" element={<CopyTradingPage />} />
          </Route>
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="kyc" element={<AdminKYC />} />
            <Route path="markets" element={<AdminMarkets />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
