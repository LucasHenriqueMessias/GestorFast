import React, { useState } from 'react';
import './Sidebar.css';
import StoreIcon from '@mui/icons-material/Store';
import BarChartIcon from '@mui/icons-material/BarChart';
import ConstructionIcon from '@mui/icons-material/Construction';
import AddTaskIcon from '@mui/icons-material/AddTask';

type TopLevelSection = 'gestao' | 'cliente' | 'ferramentas' | 'helpdesk';

export default function Sidebar({ onlyIcons = false, onExpand, children }: { onlyIcons?: boolean; onExpand?: () => void; children?: React.ReactNode }) {
    const [gestaoOpen, setGestaoOpen] = useState(false);
    const [clienteOpen, setClienteOpen] = useState(false);
    const [csOpen, setCsOpen] = useState(false);
    const [ferramentasOpen, setFerramentasOpen] = useState(false);
    const [helpdeskOpen, setHelpdeskOpen] = useState(false);
    const [consultorOpen, setConsultorOpen] = useState(false);
    const [comercialOpen, setComercialOpen] = useState(false);

    // Helper to hide text if onlyIcons is true
    const hideText = onlyIcons ? { display: 'none' } : {};

    const resetSubsections = () => {
        setConsultorOpen(false);
        setComercialOpen(false);
        setCsOpen(false);
    };

    const openTopLevelSection = (section: TopLevelSection) => {
        setGestaoOpen(section === 'gestao');
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
            case 'gestao':
                setGestaoOpen((open) => !open);
                break;
            case 'cliente':
                setClienteOpen((open) => !open);
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
                    <button
                        className="single-menu-item"
                        onClick={() => window.location.href = '/Relatorios'}
                        style={{ cursor: 'pointer' }}
                        title="Relatórios"
                    >
                        <div className="grid-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path fillRule="evenodd" clipRule="evenodd" d="M3 5.5C3 4.11929 4.11929 3 5.5 3H8.5C9.88071 3 11 4.11929 11 5.5V8.5C11 9.88071 9.88071 11 8.5 11H5.5C4.11929 11 3 9.88071 3 8.5V5.5ZM5.5 5H8.5C8.77614 5 9 5.22386 9 5.5V8.5C9 8.77614 8.77614 9 8.5 9H5.5C5.22386 9 5 8.77614 5 8.5V5.5C5 5.22386 5.22386 5 5.5 5Z" fill="white" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M13 5.5C13 4.11929 14.1193 3 15.5 3H18.5C19.8807 3 21 4.11929 21 5.5V8.5C21 9.88071 19.8807 11 18.5 11H15.5C14.1193 11 13 9.88071 13 8.5V5.5ZM15.5 5H18.5C18.7761 5 19 5.22386 19 5.5V8.5C19 8.77614 18.7761 9 18.5 9H15.5C15.2239 9 15 8.77614 15 8.5V5.5C15 5.22386 15.2239 5 15.5 5Z" fill="white" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M15.5 13C14.1193 13 13 14.1193 13 15.5V18.5C13 19.8807 14.1193 21 15.5 21H18.5C19.8807 21 21 19.8807 21 18.5V15.5C21 14.1193 19.8807 13 18.5 13H15.5ZM18.5 15H15.5C15.2239 15 15 15.2239 15 15.5V18.5C15 18.7761 15.2239 19 15.5 19H18.5C18.7761 19 19 18.7761 19 18.5V15.5C19 15.2239 18.7761 15 18.5 15Z" fill="white" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M3 15.5C3 14.1193 4.11929 13 5.5 13H8.5C9.88071 13 11 14.1193 11 15.5V18.5C11 19.8807 9.88071 21 8.5 21H5.5C4.11929 21 3 19.8807 3 18.5V15.5ZM5.5 15H8.5C8.77614 15 9 15.2239 9 15.5V18.5C9 18.7761 8.77614 19 8.5 19H5.5C5.22386 19 5 18.7761 5 18.5V15.5C5 15.2239 5.22386 15 5.5 15Z" fill="white" />
                            </svg>
                        </div>
                        <div className="button-text" style={{ ...hideText }}>Relatórios</div>
                    </button>
                    <div className="dropdown-menu">
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
                                        transform: gestaoOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}
                                >
                                    <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8"/>
                                </svg>
                            </div>
                        </div>
                        {!onlyIcons && gestaoOpen && (
                            <ul className="menu-list">
                                <li className="dropdown-menu-item">
                                    <div
                                        className="submenu-item"
                                        onClick={() => setConsultorOpen((open: boolean) => !open)}
                                        role="button"
                                        aria-expanded={consultorOpen}
                                    >
                                        <span>Consultor</span>
                                        <svg style={{ marginLeft: 8, transition: 'transform 0.2s', transform: consultorOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8" />
                                        </svg>
                                    </div>
                                    {consultorOpen && (
                                        <ul className="submenu-list">
                                            <li>
                                                <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/RegistroDeReunioes">Registro de Reuniões</a>
                                            </li>
                                            <li>
                                                <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/JornadaCrescimentoCore">Crescimento Core</a>
                                            </li>
                                            <li>
                                                <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/JornadaCrescimentoOverdelivery">Crescimento OverDelivery</a>
                                            </li>
                                        </ul>
                                    )}
                                </li>
                                <li className="dropdown-menu-item">
                                    <div
                                        className="submenu-item"
                                        onClick={() => setComercialOpen((open: boolean) => !open)}
                                        role="button"
                                        aria-expanded={comercialOpen}
                                    >
                                        <span>Comercial</span>
                                        <svg style={{ marginLeft: 8, transition: 'transform 0.2s', transform: comercialOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none">
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
                                <li className="dropdown-menu-item">
                                    <a className="submenu-item submenu-link" style={{ justifyContent: 'flex-start' }} href="/Alertas">Alertas</a>
                                </li>
                            </ul>
                        )}
                        <div
                            className="top-dropdown-menu-item"
                            style={{ borderRadius: '8px', cursor: 'pointer' }}
                            onClick={() => handleTopLevelToggle('cliente')}
                            title="Cliente"
                        >
                            <div>
                                <StoreIcon style={{ color: '#5C59E8', width: '22px', height: '22px' }} />
                            </div>
                            <div style={{ ...hideText, flex: 1, textAlign: 'left' }}> Cliente </div>
                            <div style={{ marginLeft: 'auto', ...hideText }}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="22"
                                    height="22"
                                    viewBox="0 0 22 22"
                                    fill="none"
                                    style={{
                                        transition: 'transform 0.2s',
                                        transform: clienteOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}
                                >
                                    <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8"/>
                                </svg>
                            </div>
                        </div>
                        {!onlyIcons && clienteOpen && (
                            <ul className="menu-list">
                                <li className="dropdown-menu-item">
                                    <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Clientes'}>Clientes Fast</div>
                                </li>
                                {/* <li><a className="dropdown-item" href="/cadastro-cliente">Cadastrar Cliente</a></li> */}
                                <li className="dropdown-menu-item">
                                    <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Cadastro'}>Cadastro</div>
                                </li>
                                <li className="dropdown-menu-item">
                                    <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Highlights'}>Highlights</div>
                                </li>
                                <li className="dropdown-menu-item">
                                    <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Fotografia'}>Fotografia</div>
                                </li>
                                <li className="dropdown-menu-item">
                                    <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Dores'}>Dores</div>
                                </li>
                                <li className="dropdown-menu-item">
                                    <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Socios'}>Socios</div>
                                </li>
                                <li className="dropdown-menu-item">
                                    <div
                                        className="submenu-item"
                                        onClick={() => setCsOpen((open) => !open)}
                                        role="button"
                                        aria-expanded={csOpen}
                                    >
                                        <span>CS</span>
                                        <svg style={{ marginLeft: 8, transition: 'transform 0.2s', transform: csOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8" />
                                        </svg>
                                    </div>
                                    {csOpen && (
                                        <ul className="submenu-list">
                                            <li>
                                                <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Checklist/Acompanhamento/Cliente'}>Checklist de Acompanhamento</div>
                                            </li>
                                            <li>
                                                <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Pesquisa/Satisfacao/ICR'}>Pesquisa ICR</div>
                                            </li>
                                        </ul>
                                    )}
                                </li>
                            </ul>
                        )}
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
                                        transform: ferramentasOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}
                                >
                                    <path fillRule="evenodd" clipRule="evenodd" d="M17.1482 14.3982C16.7902 14.7562 16.2098 14.7562 15.8519 14.3982L11 9.54637L6.14822 14.3982C5.79024 14.7562 5.20984 14.7562 4.85186 14.3982C4.49388 14.0402 4.49388 13.4598 4.85186 13.1018L10.6759 7.27774C10.8549 7.09875 11.1451 7.09875 11.3241 7.27774L17.1482 13.1018C17.5062 13.4598 17.5062 14.0402 17.1482 14.3982Z" fill="#5C59E8"/>
                                </svg>
                            </div>
                        </div>
                        {!onlyIcons && ferramentasOpen && (
                            <ul className="menu-list">
                                <li className="dropdown-menu-item">
                                    <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Biblioteca'}>Biblioteca</div>
                                </li>
                                <li className="dropdown-menu-item">
                                    <div className="submenu-item" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/Eventos'}>Eventos</div>
                                </li>
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
                                        transform: helpdeskOpen ? 'rotate(180deg)' : 'rotate(0deg)'
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
                    </div>
                </div>
                <div className="secondary-menu"></div>
            </div>
        </div>
    );
}
