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
import Consultar from './pages/Consultas/Consultar';
import Alertas from './pages/Alertas/Alertas';
import Funil from './pages/Comercial/Funil';
import Highlights from './pages/Highlights/Highlights';
import Fotografia from './pages/Fotografia/Fotografia';
import Dores from './pages/Dores/Dores';
import Socios from './pages/Socios/Socios';
import Biblioteca from './pages/Biblioteca/Biblioteca';
import Eventos from './pages/Eventos/Eventos';
import Ferramentas from './pages/Ferramentas/Ferramentas';
import Relatorios from './pages/Relatorios/Relatorios';
import RelatorioFast from './pages/Relatorios/RelatorioFast';
import RelatorioConsultor from './pages/Relatorios/RelatorioConsultor';
import RelatorioCliente from './pages/Relatorios/RelatorioCliente';
import AtribuidosAMim from './pages/HelpDesk/AtribuidosAMim';
import MeusChamados from './pages/HelpDesk/MeusChamados';
import NovoChamado from './pages/HelpDesk/NovoChamado';
import ChecklistAcompanhamento from './pages/CS/ChecklistAcompanhamento';
import PesquisaICR from './pages/CS/PesquisaICR';
import ListaPresenca from './pages/Eventos/ListaPresenca';

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
  if (!['/Clientes','/Relatorios','/HelpDesk/AtribuidosAMim' , '/HelpDesk/MeusChamados', '/HelpDesk/NovoChamado' ,  '/Relatorios/Cliente', '/Relatorios/Consultor', '/Relatorios/Fast' , '/Ferramentas' , '/RegistroDeReunioes', '/Eventos' ,'/Biblioteca' , '/Socios',  '/Funil', '/Fotografia' , '/Highlights' , '/home', '/Alertas', '/Cadastro', '/Dores' , '/JornadaCrescimentoCore', '/JornadaCrescimentoOverdelivery', '/ConsultarCNPJ', '/Checklist/Acompanhamento/Cliente', '/Pesquisa/Satisfacao/ICR', '/Eventos/ListaPresenca'].includes(location) && !isLogin) {
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
            <Route path="/Clientes" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Cliente /></PrivateRoute>} />
            <Route path="/RegistroDeReunioes" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><RegistroDeReunioes /></PrivateRoute>} />
            <Route path="/home" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Dashboard /></PrivateRoute>} />
            <Route path="/Cadastro" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Cadastro /></PrivateRoute>} />
            <Route path="/JornadaCrescimentoCore" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><JornadaCrescimentoCore /></PrivateRoute>} />
            <Route path="/JornadaCrescimentoOverdelivery" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><JornadaCrescimentoOverDelivery /></PrivateRoute>} />
            <Route path="/ConsultarCNPJ" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Consultar/></PrivateRoute>} />
            <Route path="/Alertas" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Alertas/></PrivateRoute>} />
            <Route path="/Funil" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Funil/></PrivateRoute>} />
            <Route path="/Highlights" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Highlights/></PrivateRoute>} />
            <Route path="/Fotografia" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Fotografia/></PrivateRoute>} />
            <Route path="/Dores" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Dores/></PrivateRoute>} />
            <Route path="/Socios" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Socios/></PrivateRoute>} />
            <Route path="/Biblioteca" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Biblioteca/></PrivateRoute>} />
            <Route path="/Eventos" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Eventos/></PrivateRoute>} />
            <Route path="/Ferramentas" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Ferramentas/></PrivateRoute>} />
            <Route path="/Relatorios" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Relatorios/></PrivateRoute>} />
            <Route path="/Relatorios/Cliente" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><RelatorioCliente /></PrivateRoute>} />
            <Route path="/Relatorios/Consultor" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><RelatorioConsultor /></PrivateRoute>} />
            <Route path="/Relatorios/Fast" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><RelatorioFast /></PrivateRoute>} />
            <Route path="/HelpDesk/AtribuidosAMim" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><AtribuidosAMim /></PrivateRoute>} />
            <Route path="/HelpDesk/MeusChamados" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><MeusChamados /></PrivateRoute>} />
            <Route path="/HelpDesk/NovoChamado" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><NovoChamado /></PrivateRoute>} />
            <Route path="/Checklist/Acompanhamento/Cliente" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><ChecklistAcompanhamento/></PrivateRoute>} />
            <Route path="/Pesquisa/Satisfacao/ICR" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><PesquisaICR/></PrivateRoute>} />
            <Route path="/Eventos/ListaPresenca" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><ListaPresenca/></PrivateRoute>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
