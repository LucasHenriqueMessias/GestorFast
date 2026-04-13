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
import { getAccessToken, getLoginTimestamp, clear } from './utils/storage';
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
import RelatorioDiretoria from './pages/Relatorios/RelatorioDiretoria';
import RelatorioGeralFaturamento from './pages/Relatorios/RelatorioGeralFaturamento';
import RelatorioGeralFaturamentoConsultor from './pages/Relatorios/RelatorioGeralFaturamentoConsultor';
import RelatorioAvisoPrevio from './pages/Relatorios/RelatorioAvisoPrevio';
import SignUp from './pages/SignUp/SignUp';
import Parceiros from './pages/Parceiros/Parceiros';
import Insights from './pages/Insights/Insights';
import Nps from './pages/NPS/Nps';
import RelatorioComercial from './pages/Relatorios/RelatorioComercial';
import CursosLista from './pages/Cursos/cursosLista';
import DetalhesCurso from './pages/Cursos/detalhesCurso';
import GestaoVideosCurso from './pages/Cursos/gestaoVideosCurso';
import CriarEditarForm from './pages/Cursos/criarEditarFormCurso';
import GestaoPerguntasVideo from './pages/Cursos/gestaoPerguntasVideo';
import QuestionarioVideoFullscreen from './pages/Cursos/questionarioVideoFullscreen';
import PontoDeApoio from './pages/pontoDeApoio/pontoDeApoio';
import RelatorioCS from './pages/Relatorios/RelatorioCS';

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
  let token = getAccessToken();
  const loginTimestamp = getLoginTimestamp();
  const location = window.location.pathname;
  const isLogin = location === '/';
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  const now = Date.now();
  const sessionExpired = !!token && (
    loginTimestamp === null || (now - loginTimestamp >= TWELVE_HOURS_MS)
  );

  if (sessionExpired) {
    clear();
    token = null;
    if (!isLogin) {
      window.location.href = '/';
      return null;
    }
  }

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
  const allowedPaths = ['/Clientes','/Relatorios','/HelpDesk/AtribuidosAMim' , '/HelpDesk/MeusChamados', '/HelpDesk/NovoChamado' ,  '/Relatorios/Cliente', '/Relatorios/Consultor', '/Relatorios/Fast' , '/Ferramentas' , '/RegistroDeReunioes', '/Eventos' ,'/Biblioteca' , '/Socios',  '/Funil', '/Fotografia' , '/Highlights' , '/home', '/Alertas', '/Cadastro', '/Dores' , '/JornadaCrescimentoCore', '/JornadaCrescimentoOverdelivery', '/ConsultarCNPJ', '/Checklist/Acompanhamento/Cliente', '/Pesquisa/Satisfacao/ICR', '/Eventos/ListaPresenca', '/Relatorios/Diretoria', '/Relatorios/Diretoria/Faturamento/Consultor', '/Relatorios/Diretoria/Faturamento/Geral', '/Relatorios/Diretoria/AvisoPrevio', '/Cadastro/Usuario', '/Parcerias', '/Analista/Insights', '/NPS', '/Relatorios/Comercial', '/PontosApoio', '/Relatorios/CS'];
  const isCursosPath = location === '/cursos' || location.startsWith('/cursos/') || location === '/Cursos' || location.startsWith('/Cursos/');

  if (!allowedPaths.includes(location) && !isCursosPath && !isLogin) {
    return (
      <Navigate to="/" replace />
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      <Sidebar onlyIcons={!sidebarOpen} onExpand={() => setSidebarOpen(true)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar onMenuClick={() => setSidebarOpen((open) => !open)} onlyIcons={!sidebarOpen} />
        <div style={{ flex: 1, minWidth: 0, width: '100%', overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/Clientes" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Cliente /></PrivateRoute>} />
            <Route path="/RegistroDeReunioes" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><RegistroDeReunioes /></PrivateRoute>} />
            <Route path="/home" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Dashboard /></PrivateRoute>} />
            <Route path="/Cadastro" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "CS", "HelpDesk"]}><Cadastro /></PrivateRoute>} />
            <Route path="/JornadaCrescimentoCore" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><JornadaCrescimentoCore /></PrivateRoute>} />
            <Route path="/JornadaCrescimentoOverdelivery" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><JornadaCrescimentoOverDelivery /></PrivateRoute>} />
            <Route path="/ConsultarCNPJ" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Consultar/></PrivateRoute>} />
            <Route path="/Alertas" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Alertas/></PrivateRoute>} />
            <Route path="/Funil" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Funil/></PrivateRoute>} />
            <Route path="/Highlights" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Highlights/></PrivateRoute>} />
            <Route path="/Fotografia" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Fotografia/></PrivateRoute>} />
            <Route path="/Dores" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Dores/></PrivateRoute>} />
            <Route path="/Socios" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Socios/></PrivateRoute>} />
            <Route path="/Biblioteca" element={<PrivateRoute allowedDepartments={[]}><Biblioteca/></PrivateRoute>} />
            <Route path="/Eventos" element={<PrivateRoute allowedDepartments={[]}><Eventos/></PrivateRoute>} />
            <Route path="/Ferramentas" element={<PrivateRoute allowedDepartments={[]}><Ferramentas/></PrivateRoute>} />
            <Route path="/Relatorios" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Relatorios/></PrivateRoute>} />
            <Route path="/Relatorios/Cliente" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><RelatorioCliente /></PrivateRoute>} />
            <Route path="/Relatorios/Consultor" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><RelatorioConsultor /></PrivateRoute>} />
            <Route path="/Relatorios/Fast" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><RelatorioFast /></PrivateRoute>} />
            <Route path="/HelpDesk/AtribuidosAMim" element={<PrivateRoute allowedDepartments={[]}><AtribuidosAMim /></PrivateRoute>} />
            <Route path="/HelpDesk/MeusChamados" element={<PrivateRoute allowedDepartments={[]}><MeusChamados /></PrivateRoute>} />
            <Route path="/HelpDesk/NovoChamado" element={<PrivateRoute allowedDepartments={[]}><NovoChamado /></PrivateRoute>} />
            <Route path="/Checklist/Acompanhamento/Cliente" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><ChecklistAcompanhamento/></PrivateRoute>} />
            <Route path="/Pesquisa/Satisfacao/ICR" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><PesquisaICR/></PrivateRoute>} />
            <Route path="/Eventos/ListaPresenca" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><ListaPresenca/></PrivateRoute>} />
            <Route path="/Relatorios/Diretoria" element={<PrivateRoute allowedDepartments={["Diretor", "Developer"]}><RelatorioDiretoria/></PrivateRoute>} />
            <Route path="/Relatorios/Diretoria/Faturamento/Geral" element={<PrivateRoute allowedDepartments={["Diretor", "Gestor", "Developer"]}><RelatorioGeralFaturamento/></PrivateRoute>} />
            <Route path="/Relatorios/Diretoria/Faturamento/Consultor" element={<PrivateRoute allowedDepartments={["Diretor", "Gestor", "Developer"]}><RelatorioGeralFaturamentoConsultor/></PrivateRoute>} />
            <Route path="/Relatorios/Diretoria/AvisoPrevio" element={<PrivateRoute allowedDepartments={["Diretor", "Gestor", "Developer"]}><RelatorioAvisoPrevio/></PrivateRoute>} />
            <Route path="Cadastro/Usuario" element={<PrivateRoute allowedDepartments={["Developer", "Diretor", "Gestor"]}><SignUp /></PrivateRoute>} />
            <Route path="/Parcerias" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Parceiros /></PrivateRoute>} />
            <Route path="/Analista/Insights" element={<PrivateRoute allowedDepartments={["Financeiro", "Analista", "Developer", "Diretor", "Gestor", "Consultor"]}><Insights /></PrivateRoute>} />  
            <Route path="/NPS/" element={<PrivateRoute allowedDepartments={["Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS"]}><Nps/></PrivateRoute >} />
            <Route path="/Relatorios/Comercial" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><RelatorioComercial/></PrivateRoute>} />
            <Route path="/cursos" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><CursosLista /></PrivateRoute>} />
            <Route path="/cursos/novo" element={<PrivateRoute allowedDepartments={["Developer", "Diretor", "Gestor"]}><CriarEditarForm /></PrivateRoute>} />
            <Route path="/cursos/:cursoId/editar" element={<PrivateRoute allowedDepartments={["Developer", "Diretor", "Gestor"]}><CriarEditarForm /></PrivateRoute>} />
            <Route path="/cursos/:cursoId" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><DetalhesCurso /></PrivateRoute>} />
            <Route path="/cursos/:cursoId/videos/novo" element={<PrivateRoute allowedDepartments={["Developer", "Diretor", "Gestor"]}><GestaoVideosCurso /></PrivateRoute>} />
            <Route path="/cursos/:cursoId/videos/:videoId/editar" element={<PrivateRoute allowedDepartments={["Developer", "Diretor", "Gestor"]}><GestaoVideosCurso /></PrivateRoute>} />
            <Route path="/cursos/:cursoId/videos/:videoId/perguntas" element={<PrivateRoute allowedDepartments={["Developer", "Diretor", "Gestor"]}><GestaoPerguntasVideo /></PrivateRoute>} />
            <Route path="/cursos/:cursoId/videos/:videoId/questionario" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><QuestionarioVideoFullscreen /></PrivateRoute>} />

            <Route path="/Cursos" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Navigate to="/cursos" /></PrivateRoute>} />
            <Route path="/Cursos/Lista" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Navigate to="/cursos" /></PrivateRoute>} />
            <Route path="/Cursos/Detalhes/:id" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Navigate to="/cursos" /></PrivateRoute>} />
            <Route path="/Cursos/GestaoVideos/:id" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Navigate to="/cursos" /></PrivateRoute>} />
            <Route path="/Cursos/CriaEditar/:id?" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><Navigate to="/cursos" /></PrivateRoute>} />
            <Route path="/PontosApoio" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><PontoDeApoio /></PrivateRoute>} />
            <Route path="/Relatorios/CS" element={<PrivateRoute allowedDepartments={["Financeiro", "Comercial", "Analista", "Developer", "Diretor", "Gestor", "Consultor", "CS", "HelpDesk"]}><RelatorioCS /></PrivateRoute>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
