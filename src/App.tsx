import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import GestionStock from "@/pages/GestionStock";
import CargaStock from "@/pages/CargaStock";
import FichasTecnicas from "@/pages/FichasTecnicas";
import Requisiciones from "@/pages/Requisiciones";
import Historico from "@/pages/Historico";
import Usuarios from "@/pages/Usuarios";
import Configuracion from "@/pages/Configuracion";
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
      <Route path="/gestion" element={<ProtectedRoute adminOnly><GestionStock /></ProtectedRoute>} />
      <Route path="/carga" element={<ProtectedRoute><CargaStock /></ProtectedRoute>} />
      <Route path="/fichas" element={<ProtectedRoute><FichasTecnicas /></ProtectedRoute>} />
      <Route path="/requisiciones" element={<ProtectedRoute><Requisiciones /></ProtectedRoute>} />
      <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
      <Route path="/usuarios" element={<ProtectedRoute adminOnly><Usuarios /></ProtectedRoute>} />
      <Route path="/configuracion" element={<ProtectedRoute adminOnly><Configuracion /></ProtectedRoute>} />
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
