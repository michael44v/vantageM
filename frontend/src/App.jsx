import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { simulatePriceMove } from "./store/slices/tradingSlice";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RequireAdmin, RedirectIfAuth, RequireAuth } from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import TradingPage from "./pages/TradingPage";
import UnverifiedBanner from "./components/UnverifiedBanner";
import WhatsAppButton from "./components/WhatsAppButton";
import PlatformsPage from "./pages/PlatformsPage";
import PromotionsPage from "./pages/PromotionsPage";
import PartnersPage from "./pages/PartnersPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLiveTrades from "./pages/admin/AdminLiveTrades";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminKYC from "./pages/admin/AdminKYC";
import AdminSignals from "./pages/admin/AdminSignals";
import AdminMail from "./pages/admin/AdminMail";
import { AdminMarkets, AdminSettings } from "./pages/admin/AdminMarketsAndSettings";

import DashboardLayout from "./pages/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import AccountManagement from "./pages/dashboard/AccountManagement";
import DepositWithdraw from "./pages/dashboard/DepositWithdraw";
import InternalTransfer from "./pages/dashboard/InternalTransfer";
import KYCSection from "./pages/dashboard/KYCSection";
import CopyTradingPage from "./pages/dashboard/CopyTradingPage";
import TerminalPage from "./pages/TerminalPage";
import TransactionsPage from "./pages/dashboard/TransactionsPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";


export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(simulatePriceMove());
    }, 1000); // Pulse every second
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <AuthProvider>
      <UnverifiedBanner />
      <WhatsAppButton />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trading" element={<TradingPage />} />
          <Route path="/platforms" element={<PlatformsPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/verify" element={<VerifyEmailPage />} />
         
          <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/trading-terminal" element={<RequireAuth><TerminalPage /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
         <Route path="transactions" element={<TransactionsPage />} />
            <Route index element={<DashboardHome />} />
            <Route path="accounts" element={<AccountManagement />} />
            <Route path="funds" element={<DepositWithdraw />} />
            <Route path="transfer" element={<InternalTransfer />} />
            <Route path="kyc" element={<KYCSection />} />
            <Route path="copy" element={<CopyTradingPage />} />
          </Route>
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminDashboard />} />
            <Route path="live-trades" element={<AdminLiveTrades />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="kyc" element={<AdminKYC />} />
            <Route path="mail" element={<AdminMail />} />
            <Route path="copy-trading" element={<AdminSignals />} />
            <Route path="markets" element={<AdminMarkets />} />
            <Route path="settings" element={<AdminSettings />} />


          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
