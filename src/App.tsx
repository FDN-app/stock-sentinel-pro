import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Stock from "@/pages/Stock";
import LoadStock from "@/pages/LoadStock";
import TechnicalSheets from "@/pages/TechnicalSheets";
import Requisitions from "@/pages/Requisitions";
import History from "@/pages/History";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;
  return <AppLayout>{children}</AppLayout>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/gestion" element={<ProtectedRoute adminOnly><Stock /></ProtectedRoute>} />
      <Route path="/carga" element={<ProtectedRoute><LoadStock /></ProtectedRoute>} />
      <Route path="/fichas" element={<ProtectedRoute><TechnicalSheets /></ProtectedRoute>} />
      <Route path="/requisiciones" element={<ProtectedRoute><Requisitions /></ProtectedRoute>} />
      <Route path="/historico" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/usuarios" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
      <Route path="/configuracion" element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
