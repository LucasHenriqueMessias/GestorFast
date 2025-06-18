import React, { useState } from 'react'
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { getUsername, getNivel, getDepartment} from '../../utils/storage';
import './Topbar.css'; // Assuming you have a CSS file for styling

const Topbar = ({ onMenuClick, onlyIcons = false }: { onMenuClick: () => void, onlyIcons?: boolean }) => {
  const username = getUsername();
  const nivel = getNivel();
  const department = getDepartment();
  const [showDetails, setShowDetails] = useState(false);
  const detailsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        setShowDetails(false);
      }
    }
    if (showDetails) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDetails]);

  return (
    <div className="topbar">
      <MenuIcon style={{ color: '#5C59E8', width: '32px', height: '32px', cursor: 'pointer' }} onClick={onMenuClick} />
      <div className={onlyIcons ? "topbar-right topbar-right--collapsed" : "topbar-right"}>
        <div className="topbar-right-menu"> 
          <div className={onlyIcons ? "topbar-right-menu-icon topbar-right-menu-icon--collapsed" : "topbar-right-menu-icon"}>
            <NotificationsIcon style={{ color: '#667085', cursor: 'pointer' }} />
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
                  left: '50%',
                  transform: 'translateX(-50%)',
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
