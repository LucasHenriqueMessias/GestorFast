import React, { useState, useEffect } from 'react'
import axios from 'axios';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import { getUsername, getNivel, getDepartment, clear, getAccessToken } from '../../utils/storage';
import './Topbar.css'; // Assuming you have a CSS file for styling

interface Notification {
  id: number;
  titulo: string;
  descricao: string;
  lido: boolean;
  data_criacao: string;
}

const Topbar = ({ onMenuClick, onlyIcons = false }: { onMenuClick: () => void, onlyIcons?: boolean }) => {
  const username = getUsername();
  const nivel = getNivel();
  const department = getDepartment();
  const [showDetails, setShowDetails] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const detailsRef = React.useRef<HTMLDivElement>(null);
  const notificationsRef = React.useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    clear();
    window.location.href = '/';
  };

  const fetchNotifications = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-notificacao`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  const handleNotificationsClick = () => {
    setShowNotifications(v => !v);
    setShowDetails(false);
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        setShowDetails(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showDetails || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDetails, showNotifications]);

  return (
    <div className="topbar">
      <MenuIcon style={{ color: '#5C59E8', width: '32px', height: '32px', cursor: 'pointer' }} onClick={onMenuClick} />
      <div className={onlyIcons ? "topbar-right topbar-right--collapsed" : "topbar-right"}>
        <div className="topbar-right-menu"> 
          <div className={onlyIcons ? "topbar-right-menu-icon topbar-right-menu-icon--collapsed" : "topbar-right-menu-icon"}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <NotificationsIcon 
                style={{ color: '#667085', cursor: 'pointer' }} 
                onClick={handleNotificationsClick}
              />
              {showNotifications && (
                <div ref={notificationsRef} style={{
                  marginTop: 0,
                  background: 'rgba(255,255,255,0.98)',
                  border: '1px solid #d1d5db',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(60,60,130,0.12)',
                  padding: '12px 0',
                  minWidth: 320,
                  maxHeight: 400,
                  overflowY: 'auto',
                  position: 'absolute',
                  right: 0,
                  left: 'auto',
                  top: 'calc(100% + 10px)',
                  zIndex: 20,
                  transition: 'opacity 0.2s',
                  opacity: showNotifications ? 1 : 0,
                  fontFamily: 'Segoe UI, Arial, sans-serif',
                  color: '#222'
                }}>
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          backgroundColor: notif.lido ? '#fff' : '#f0f4ff'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = notif.lido ? '#f5f5f5' : '#e8ecff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = notif.lido ? '#fff' : '#f0f4ff';
                        }}
                      >
                        <div style={{ fontWeight: notif.lido ? 400 : 600, fontSize: 14, marginBottom: 4 }}>
                          {notif.titulo}
                        </div>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                          {notif.descricao}
                        </div>
                        <div style={{ fontSize: 11, color: '#999' }}>
                          {new Date(notif.data_criacao).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px 16px', textAlign: 'center', color: '#999', fontSize: 14 }}>
                      Nenhuma notificação
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <div
                className="topbar-right-menu-user"
                style={{ cursor: 'pointer', zIndex: 21, background: 'transparent' }}
                onClick={() => setShowDetails(v => !v)}
                tabIndex={0}
                onBlur={e => {
                  // Fecha o dropdown ao perder o foco, mas só se não for para o dropdown
                  setTimeout(() => {
                    if (document.activeElement && detailsRef.current && !detailsRef.current.contains(document.activeElement)) {
                      setShowDetails(false);
                    }
                  }, 0);
                }}
              >
                <AccountCircleIcon style={{ color: '#667085', cursor: 'pointer' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div className="topbar-right-menu-user-name">
                    <span style={{ color: '#667085', fontSize: '14px' }}>{username}</span>
                  </div>
                </div>
                <KeyboardArrowDownIcon
                  style={{
                    color: '#667085',
                    cursor: 'pointer',
                    transition: 'transform 0.25s',
                    transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </div>
              {showDetails && (
                <div ref={detailsRef} style={{
                  marginTop: 0,
                  background: 'rgba(255,255,255,0.98)',
                  border: '1px solid #d1d5db',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(60,60,130,0.12)',
                  padding: '18px 24px',
                  minWidth: 220,
                  position: 'absolute',
                  right: 0,
                  left: 'auto',
                  top: 'calc(100% + 10px)',
                  zIndex: 20,
                  transition: 'opacity 0.2s',
                  opacity: showDetails ? 1 : 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontFamily: 'Segoe UI, Arial, sans-serif',
                  color: '#222',
                  fontSize: 15,
                  letterSpacing: 0.1,
                  fontWeight: 400
                }}>
                  <div><span style={{ color: '#888', fontWeight: 500 }}>Nível:</span> {nivel}</div>
                  <div><span style={{ color: '#888', fontWeight: 500 }}>Departamento:</span> {department}</div>
                  <button
                    className="topbar-logout-button topbar-logout-button--dropdown"
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogoutIcon fontSize="small" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Topbar
