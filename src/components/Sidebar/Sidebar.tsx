import React, { useState } from 'react';
import './Sidebar.css';
import StoreIcon from '@mui/icons-material/Store';
import BarChartIcon from '@mui/icons-material/BarChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ConstructionIcon from '@mui/icons-material/Construction';
import AddTaskIcon from '@mui/icons-material/AddTask';
import { getDepartment } from '../../utils/storage';

type TopLevelSection = 'dashboard' | 'gestao' | 'aprendizagem' | 'cliente' | 'ferramentas' | 'helpdesk';

export default function Sidebar({ onlyIcons = false, onExpand, children }: { onlyIcons?: boolean; onExpand?: () => void; children?: React.ReactNode }) {
    const [dashboardOpen, setDashboardOpen] = useState(false);
    const [gestaoOpen, setGestaoOpen] = useState(false);
    const [aprendizagemOpen, setAprendizagemOpen] = useState(false);
    const [clienteOpen, setClienteOpen] = useState(false);
    const [csOpen, setCsOpen] = useState(false);
    const [ferramentasOpen, setFerramentasOpen] = useState(false);
    const [helpdeskOpen, setHelpdeskOpen] = useState(false);
    const [comercialOpen, setComercialOpen] = useState(false);
    const [consultoresFinanceirosOpen, setConsultoresFinanceirosOpen] = useState(false);
    const [registrosFinanceirosOpen, setRegistrosFinanceirosOpen] = useState(false);
    const [analistasOpen, setAnalistasOpen] = useState(false);
    const [registrosAnalistasOpen, setRegistrosAnalistasOpen] = useState(false);
    const [registrosCsOpen, setRegistrosCsOpen] = useState(false);
    const [diretoriaOpen, setDiretoriaOpen] = useState(false);
    const [clientesSubmenuOpen, setClientesSubmenuOpen] = useState(false);

    // Get user department
    const department = getDepartment();

    // Helper to check if user can see all items
    const canSeeAll = department === 'Developer' || department === 'Diretor' || department === 'Gestor';
    const isConsultor = department === 'Consultor';
    const isAnalista = department === 'Analista';
    const isComercial = department === 'Comercial';
    const isDiretor = department === 'Diretor';

    // Helper to hide text if onlyIcons is true
    const hideText = onlyIcons ? { display: 'none' } : {};

    const resetSubsections = () => {
        setComercialOpen(false);
        setCsOpen(false);
        setConsultoresFinanceirosOpen(false);
        setRegistrosFinanceirosOpen(false);
        setAnalistasOpen(false);
        setRegistrosAnalistasOpen(false);
        setRegistrosCsOpen(false);
        setDiretoriaOpen(false);
        setClientesSubmenuOpen(false);
    };

    const openTopLevelSection = (section: TopLevelSection) => {
        setDashboardOpen(section === 'dashboard');
        setGestaoOpen(section === 'gestao');
        setAprendizagemOpen(section === 'aprendizagem');
        setClienteOpen(section === 'cliente');
        setFerramentasOpen(section === 'ferramentas');
        setHelpdeskOpen(section === 'helpdesk');
    };

    const handleTopLevelToggle = (section: TopLevelSection) => {
        if (onlyIcons) {
            resetSubsections();
            onExpand?.();
            openTopLevelSection(section);
            return;
        }

        switch (section) {
            case 'dashboard':
                setDashboardOpen((open) => !open);
                break;
            case 'gestao':
                setGestaoOpen((open) => !open);
                break;
            case 'cliente':
                setClienteOpen((open) => !open);
                break;
            case 'aprendizagem':
                setAprendizagemOpen((open) => !open);
                break;
            case 'ferramentas':
                setFerramentasOpen((open) => !open);
                break;
            case 'helpdesk':
                setHelpdeskOpen((open) => !open);
                break;
            default:
                break;
        }
    };

    return (
        <div className={onlyIcons ? "sidebar sidebar--collapsed" : "sidebar"}>
            <div className="logo-container">
                <a href="/home">
                    <img src="https://www.fastassessoria.com.br/img/logo.png" style={{ width: '100%', marginTop: 'calc(8%)' }} alt='logotipo fast assessoria' />
                </a>
            </div>
            <div className="menu">
                <div className="main-menu">
                    <div className="dropdown-menu">
                        <div
                            className="top-dropdown-menu-item"
                            style={{ borderRadius: '8px', cursor: 'pointer' }}
                            onClick={() => handleTopLevelToggle('dashboard')}
                            title="Dashboard"
                        >
                            <div>
                                <DashboardIcon style={{ color: '#5C59E8', width: '22px', height: '22px' }} />
                            </div>
                            <div style={{ ...hideText, flex: 1, textAlign: 'left' }}> Dashboard </div>
                            <div style={{ marginLeft: 'auto', ...hideText }}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="22"
                                    height="22"
                                    viewBox="0 0 22 22"
                                    fill="none"
                                    style={{
                                        transition: 'transform 0.2s',
                                        transform: dashboardOpen ? 'rotate(0deg)' : 'rotate(180deg)'
                                    }}
                                >
                                    <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8"/>
                                </svg>
                            </div>
                        </div>
                        {!onlyIcons && dashboardOpen && (
                            <ul className="menu-list">
                                <li className="dropdown-menu-item">
                                    <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Relatorios/Consultor">Consultores</a>
                                </li>
                                <li className="dropdown-menu-item">
                                    <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Relatorios/Cliente">Clientes</a>
                                </li>
                                <li className="dropdown-menu-item">
                                    <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Relatorios/Fast">Fast</a>
                                </li>
                                <li className="dropdown-menu-item">
                                    <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Relatorios/CS">Sucesso do Cliente</a>
                                </li>
                                <li className="dropdown-menu-item">
                                    <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Relatorios/Comercial">Comercial</a>
                                </li>
                                {canSeeAll && (
                                    <li className="dropdown-menu-item">
                                        <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Relatorios/Diretoria/Faturamento/Geral">Faturamento Geral</a>
                                    </li>
                                )}
                                {canSeeAll && (
                                    <li className="dropdown-menu-item">
                                        <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Relatorios/Diretoria/Faturamento/Consultor">Faturamento por Consultor</a>
                                    </li>
                                )}
                                {canSeeAll && (
                                    <li className="dropdown-menu-item">
                                        <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Relatorios/Diretoria/AvisoPrevio">Aviso Prévio</a>
                                    </li>
                                )}
                            </ul>
                        )}
                        <div
                            className="top-dropdown-menu-item"
                            style={{ borderRadius: '8px', cursor: 'pointer' }}
                            onClick={() => handleTopLevelToggle('gestao')}
                            title="Gestão"
                        >
                            <div>
                                <BarChartIcon style={{ color: '#5C59E8', width: '22px', height: '22px' }} />
                            </div>
                            <div style={{ ...hideText, flex: 1, textAlign: 'left' }}> Gestão </div>
                            <div style={{ marginLeft: 'auto', ...hideText }}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="22"
                                    height="22"
                                    viewBox="0 0 22 22"
                                    fill="none"
                                    style={{
                                        transition: 'transform 0.2s',
                                        transform: gestaoOpen ? 'rotate(0deg)' : 'rotate(180deg)'
                                    }}
                                >
                                    <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8"/>
                                </svg>
                            </div>
                        </div>
                        {!onlyIcons && gestaoOpen && (
                            <ul className="menu-list">
                                {(canSeeAll || isConsultor) && (
                                    <li className="dropdown-menu-item">
                                        <div
                                            className="submenu-item"
                                            onClick={() => setConsultoresFinanceirosOpen((open: boolean) => !open)}
                                            role="button"
                                            aria-expanded={consultoresFinanceirosOpen}
                                        >
                                            <span>Consultores Financeiros</span>
                                            <svg style={{ marginLeft: 8, transition: 'transform 0.2s', transform: consultoresFinanceirosOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8" />
                                            </svg>
                                        </div>
                                        {consultoresFinanceirosOpen && (
                                            <ul className="submenu-list">
                                                <li>
                                                    <div
                                                        className="submenu-item"
                                                        onClick={() => setRegistrosFinanceirosOpen((open: boolean) => !open)}
                                                        role="button"
                                                        aria-expanded={registrosFinanceirosOpen}
                                                    >
                                                        <span>Registros</span>
                                                        <svg style={{ marginLeft: 8, transition: 'transform 0.2s', transform: registrosFinanceirosOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none">
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8" />
                                                        </svg>
                                                    </div>
                                                    {registrosFinanceirosOpen && (
                                                        <ul className="submenu-list">
                                                            <li>
                                                                <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Dores">Dores</a>
                                                            </li>
                                                            <li>
                                                                <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Fotografia">Fotografia</a>
                                                            </li>
                                                            {!isDiretor && (
                                                                <li>
                                                                    <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/RegistroDeReunioes">Reuniões</a>
                                                                </li>
                                                            )}
                                                            <li>
                                                                <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/JornadaCrescimentoCore">Atividades Core</a>
                                                            </li>
                                                            <li>
                                                                <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/JornadaCrescimentoOverdelivery">Overdelivery</a>
                                                            </li>
                                                            <li>
                                                                <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Highlights">Highlights</a>
                                                            </li>
                                                            {!isDiretor && (
                                                                <li>
                                                                    <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Alertas">Alertas</a>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    )}
                                                </li>
                                            </ul>
                                        )}
                                    </li>
                                )}
                                {(canSeeAll || isComercial) && (
                                    <li className="dropdown-menu-item">
                                        <div
                                            className="submenu-item"
                                            onClick={() => setComercialOpen((open: boolean) => !open)}
                                            role="button"
                                            aria-expanded={comercialOpen}
                                        >
                                            <span>Consultores Comerciais</span>
                                            <svg style={{ marginLeft: 8, transition: 'transform 0.2s', transform: comercialOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8" />
                                            </svg>
                                        </div>
                                        {comercialOpen && (
                                            <ul className="submenu-list">
                                                <li>
                                                    <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Funil">Funil</a>
                                                </li>
                                            </ul>
                                        )}
                                    </li>
                                )}
                                {(canSeeAll || isAnalista || isConsultor) && (
                                    <li className="dropdown-menu-item">
                                        <div
                                            className="submenu-item"
                                            onClick={() => setAnalistasOpen((open: boolean) => !open)}
                                            role="button"
                                            aria-expanded={analistasOpen}
                                        >
                                            <span>Analistas</span>
                                            <svg style={{ marginLeft: 8, transition: 'transform 0.2s', transform: analistasOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8" />
                                            </svg>
                                        </div>
                                        {analistasOpen && (
                                            <ul className="submenu-list">
                                                <li>
                                                    <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Analista/Insights">Insights</a>
                                                </li>
                                                {((canSeeAll && !isDiretor) || isAnalista) && (
                                                    <li>
                                                        <div
                                                            className="submenu-item"
                                                            onClick={() => setRegistrosAnalistasOpen((open: boolean) => !open)}
                                                            role="button"
                                                            aria-expanded={registrosAnalistasOpen}
                                                        >
                                                            <span>Registros</span>
                                                            <svg style={{ marginLeft: 8, transition: 'transform 0.2s', transform: registrosAnalistasOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none">
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8" />
                                                            </svg>
                                                        </div>
                                                        {registrosAnalistasOpen && (
                                                            <ul className="submenu-list">
                                                                {!isDiretor && (
                                                                    <li>
                                                                        <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/RegistroDeReunioes">Reuniões</a>
                                                                    </li>
                                                                )}
                                                                {!isDiretor && (
                                                                    <li>
                                                                        <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Alertas">Alertas</a>
                                                                    </li>
                                                                )}
                                                            </ul>
                                                        )}
                                                    </li>
                                                )}
                                            </ul>
                                        )}
                                    </li>
                                )}
                                {(canSeeAll || isConsultor || isComercial) && (
                                    <li className="dropdown-menu-item">
                                        <div
                                            className="submenu-item"
                                            onClick={() => setCsOpen((open: boolean) => !open)}
                                            role="button"
                                            aria-expanded={csOpen}
                                        >
                                            <span>CS</span>
                                            <svg style={{ marginLeft: 8, transition: 'transform 0.2s', transform: csOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8" />
                                            </svg>
                                        </div>
                                        {csOpen && (
                                            <ul className="submenu-list">
                                                <li>
                                                    <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Checklist/Acompanhamento/Cliente'}>Checklist de Acompanhamento</div>
                                                </li>
                                                {canSeeAll && (
                                                    <li>
                                                        <div
                                                            className="submenu-item"
                                                            onClick={() => setRegistrosCsOpen((open: boolean) => !open)}
                                                            role="button"
                                                            aria-expanded={registrosCsOpen}
                                                        >
                                                            <span>Registros</span>
                                                            <svg style={{ marginLeft: 8, transition: 'transform 0.2s', transform: registrosCsOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none">
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8" />
                                                            </svg>
                                                        </div>
                                                        {registrosCsOpen && (
                                                            <ul className="submenu-list">
                                                                {!isDiretor && (
                                                                    <li>
                                                                        <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/RegistroDeReunioes">Reuniões</a>
                                                                    </li>
                                                                )}
                                                                {!isDiretor && (
                                                                    <li>
                                                                        <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Alertas">Alertas</a>
                                                                    </li>
                                                                )}
                                                                <li>
                                                                    <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Insights">Insights</a>
                                                                </li>
                                                                <li>
                                                                    <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/NPS">NPS</a>
                                                                </li>
                                                                <li>
                                                                    <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Pesquisa/Satisfacao/ICR">ICR</a>
                                                                </li>
                                                            </ul>
                                                        )}
                                                    </li>
                                                )}
                                            </ul>
                                        )}
                                    </li>
                                )}
                                {canSeeAll && (
                                    <li className="dropdown-menu-item">
                                        <div
                                            className="submenu-item"
                                            onClick={() => setDiretoriaOpen((open: boolean) => !open)}
                                            role="button"
                                            aria-expanded={diretoriaOpen}
                                        >
                                            <span>Diretoria</span>
                                            <svg style={{ marginLeft: 8, transition: 'transform 0.2s', transform: diretoriaOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8" />
                                            </svg>
                                        </div>
                                        {diretoriaOpen && (
                                            <ul className="submenu-list">
                                                <li>
                                                    <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/RegistroDeReunioes">Registro de Reuniões</a>
                                                </li>
                                                <li>
                                                    <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Alertas">Alertas de Clientes</a>
                                                </li>
                                            </ul>
                                        )}
                                    </li>
                                )}
                            </ul>
                        )}
                        {(canSeeAll || isComercial || isConsultor) && (
                            <>
                                <div
                                    className="top-dropdown-menu-item"
                                    style={{ borderRadius: '8px', cursor: 'pointer' }}
                                    onClick={() => handleTopLevelToggle('cliente')}
                                    title="Cadastro"
                                >
                                    <div>
                                        <StoreIcon style={{ color: '#5C59E8', width: '22px', height: '22px' }} />
                                    </div>
                                    <div style={{ ...hideText, flex: 1, textAlign: 'left' }}> Cadastro </div>
                                    <div style={{ marginLeft: 'auto', ...hideText }}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="22"
                                            height="22"
                                            viewBox="0 0 22 22"
                                            fill="none"
                                            style={{
                                                transition: 'transform 0.2s',
                                                transform: clienteOpen ? 'rotate(0deg)' : 'rotate(180deg)'
                                            }}
                                        >
                                            <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8"/>
                                        </svg>
                                    </div>
                                </div>
                                {!onlyIcons && clienteOpen && (
                                    <ul className="menu-list">
                                        <li className="dropdown-menu-item">
                                            <div
                                                className="submenu-item"
                                                onClick={() => setClientesSubmenuOpen((open: boolean) => !open)}
                                                role="button"
                                                aria-expanded={clientesSubmenuOpen}
                                            >
                                                <span>Clientes</span>
                                                <svg style={{ marginLeft: 8, transition: 'transform 0.2s', transform: clientesSubmenuOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8" />
                                                </svg>
                                            </div>
                                            {clientesSubmenuOpen && (
                                                <ul className="submenu-list">
                                                    <li>
                                                        <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Clientes'}>Clientes</div>
                                                    </li>
                                                    {!isConsultor && (
                                                        <li>
                                                            <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Cadastro'}>Empresa</div>
                                                        </li>
                                                    )}
                                                    <li>
                                                        <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Socios'}>Sócios</div>
                                                    </li>
                                                    <li>
                                                        <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/PontosApoio'}>Pontos de apoio</div>
                                                    </li>
                                                </ul>
                                            )}
                                        </li>
                                        {(canSeeAll || isConsultor || isComercial) && (
                                            <>
                                                <li className="dropdown-menu-item">
                                                    <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Parcerias'}>Parceiros</div>
                                                </li>
                                            </>
                                        )}
                                        {canSeeAll && (
                                            <>
                                                <li className="dropdown-menu-item">
                                                    <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Cadastro/Usuario'}>Prestadores de serviço</div>
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                )}
                            </>
                        )}
                        {(
                            <>
                                <div
                                    className="top-dropdown-menu-item"
                                    style={{ borderRadius: '8px', cursor: 'pointer' }}
                                    onClick={() => handleTopLevelToggle('aprendizagem')}
                                    title="Aprendizagem Contínua"
                                >
                                    <div>
                                        <AutoStoriesIcon style={{ color: '#5C59E8', width: '22px', height: '22px' }} />
                                    </div>
                                    <div style={{ ...hideText, flex: 1, textAlign: 'left' }}> Aprendizagem Contínua </div>
                                    <div style={{ marginLeft: 'auto', ...hideText }}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="22"
                                            height="22"
                                            viewBox="0 0 22 22"
                                            fill="none"
                                            style={{
                                                transition: 'transform 0.2s',
                                                transform: aprendizagemOpen ? 'rotate(0deg)' : 'rotate(180deg)'
                                            }}
                                        >
                                            <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8"/>
                                        </svg>
                                    </div>
                                </div>
                                {!onlyIcons && aprendizagemOpen && (
                                    <ul className="menu-list">
                                        <li className="dropdown-menu-item">
                                            <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Biblioteca">Biblioteca FAST</a>
                                        </li>
                                        <li className="dropdown-menu-item">
                                            <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Cursos">Cursos FAST</a>
                                        </li>
                                        <li className="dropdown-menu-item">
                                            <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Eventos">Agenda de Eventos</a>
                                        </li>
                                    </ul>
                                )}
                            </>
                        )}
                        {(
                            <>
                                <div
                                    className="top-dropdown-menu-item"
                                    style={{ borderRadius: '8px', cursor: 'pointer' }}
                                    onClick={() => handleTopLevelToggle('ferramentas')}
                                    title="Ferramentas"
                                >
                                    <div>
                                        <ConstructionIcon style={{ color: '#5C59E8', width: '22px', height: '22px' }} />
                                    </div>
                                    <div style={{ ...hideText, flex: 1, textAlign: 'left' }}> Ferramentas </div>
                                    <div style={{ marginLeft: 'auto', ...hideText }}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="22"
                                            height="22"
                                            viewBox="0 0 22 22"
                                            fill="none"
                                            style={{
                                                transition: 'transform 0.2s',
                                                transform: ferramentasOpen ? 'rotate(0deg)' : 'rotate(180deg)'
                                            }}
                                        >
                                            <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8"/>
                                        </svg>
                                    </div>
                                </div>
                                {!onlyIcons && ferramentasOpen && (
                                    <ul className="menu-list">
                                        <li className="dropdown-menu-item">
                                            <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Eventos/ListaPresenca'}>Lista de Presença</div>
                                        </li>
                                        <li className="dropdown-menu-item">
                                            <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Ferramentas'}>Ferramentas Desenvolvidas</div>
                                        </li>
                                        {/* <li className="dropdown-menu-item" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/SalaDeReuniao'} >Sala de Reunião</li> */}
                                        <li className="dropdown-menu-item">
                                            <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/ConsultarCNPJ">Consultar CNPJ</a>
                                        </li>
                                    </ul>
                                )}
                            </>
                        )}
                        {(
                            <>
                                <div
                                    className="top-dropdown-menu-item"
                                    style={{ borderRadius: '8px', cursor: 'pointer' }}
                                    onClick={() => handleTopLevelToggle('helpdesk')}
                                    title="HelpDesk"
                                >
                                    <div>
                                        <AddTaskIcon style={{ color: '#5C59E8', width: '22px', height: '22px' }} />
                                    </div>
                                    <div style={{ ...hideText, flex: 1, textAlign: 'left' }}> HelpDesk </div>
                                    <div style={{ marginLeft: 'auto', ...hideText }}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="22"
                                            height="22"
                                            viewBox="0 0 22 22"
                                            fill="none"
                                            style={{
                                                transition: 'transform 0.2s',
                                                transform: helpdeskOpen ? 'rotate(0deg)' : 'rotate(180deg)'
                                            }}
                                        >
                                            <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8"/>
                                        </svg>
                                    </div>
                                </div>
                                {!onlyIcons && helpdeskOpen && (
                                    <ul className="menu-list">
                                        <li className="dropdown-menu-item">
                                            <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/HelpDesk/NovoChamado'}>Novo Chamado</div>
                                        </li>
                                        <li className="dropdown-menu-item">
                                            <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/HelpDesk/MeusChamados'}>Meus Chamados</div>
                                        </li>
                                        <li className="dropdown-menu-item">
                                            <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/HelpDesk/AtribuidosAMim'}>Atribuidos A Mim</div>
                                        </li>
                                    </ul>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <div className="secondary-menu"></div>
            </div>
        </div>
    );
}
