import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './themes/muiTheme';
import Dashboard from './pages/Dashboard/Dashboard';
import { LicenseInfo } from '@mui/x-license-pro';
import Sidebar from './components/Sidebar/Sidebar';
import Topbar from './components/TopBar/Topbar';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import RegistroDeReunioes from './pages/RegistroDeReunioes/RegistroDeReunioes';
import Cliente from './pages/Cliente/Cliente';
import PrivateRoute from './components/PrivateRoute';
import { getAccessToken } from './utils/storage';
import Cadastro from './pages/Cliente/Cadastro';
import JornadaCrescimentoCore from './pages/Cliente/JornadaCrescimentoCore';
import JornadaCrescimentoOverDelivery from './pages/Cliente/JornadaCrescimentoOverDelivery';

LicenseInfo.setLicenseKey('78ba75aca6b5ae150567b5de31e72a61Tz0xMTM2NDIsRT0xNzgwMDEyNzk5MDAwLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1RMy0yMDI0LEtWPTI=');

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const token = getAccessToken();
  const location = window.location.pathname;
  const isLogin = location === '/';

  // Se não estiver logado, só permite acesso à tela de login
  if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
    if (!isLogin) {
      window.location.href = '/';
      return null;
    }
    // Não renderiza sidebar/topbar na tela de login
    return (
      <div style={{ minHeight: '100vh', width: '100vw' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    );
  }

  // Renderiza layout normal
  if (isLogin) {
    // Não renderiza sidebar/topbar na tela de login
    return (
      <div style={{ minHeight: '100vh', width: '100vw' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    );
  }
  // Se rota não for reconhecida, redireciona para login SEM sidebar/topbar
  if (!['/Clientes', '/RegistroDeReunioes', '/home', '/Cadastro', '/JornadaCrescimentoCore', '/JornadaCrescimentoOverdelivery'].includes(location) && !isLogin) {
    return (
      <Navigate to="/" replace />
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      <Sidebar onlyIcons={!sidebarOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar onMenuClick={() => setSidebarOpen((open) => !open)} onlyIcons={!sidebarOpen} />
        <div style={{ flex: 1, minWidth: 0, width: '100%', overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/Clientes" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "developer", "Diretor", "Gestor", "Consultor", "CS"]}><Cliente /></PrivateRoute>} />
            <Route path="/RegistroDeReunioes" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "developer", "Diretor", "Gestor", "Consultor", "CS"]}><RegistroDeReunioes /></PrivateRoute>} />
            <Route path="/home" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "developer", "Diretor", "Gestor", "Consultor", "CS"]}><Dashboard /></PrivateRoute>} />
            <Route path="/Cadastro" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "developer", "Diretor", "Gestor", "Consultor", "CS"]}><Cadastro /></PrivateRoute>} />
            <Route path="/JornadaCrescimentoCore" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "developer", "Diretor", "Gestor", "Consultor", "CS"]}><JornadaCrescimentoCore /></PrivateRoute>} />
            <Route path="/JornadaCrescimentoOverdelivery" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "developer", "Diretor", "Gestor", "Consultor", "CS"]}><JornadaCrescimentoOverDelivery /></PrivateRoute>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
