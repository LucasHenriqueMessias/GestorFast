import React from 'react'
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { getUsername, getNivel, getDepartment } from '../../utils/storage';
import './Topbar.css'; // Assuming you have a CSS file for styling

const Topbar = ({ onMenuClick, onlyIcons = false }: { onMenuClick: () => void, onlyIcons?: boolean }) => {
  return (
    <div className="topbar">
      <MenuIcon style={{ color: '#5C59E8', width: '32px', height: '32px', cursor: 'pointer' }} onClick={onMenuClick} />
      <div className={onlyIcons ? "topbar-right topbar-right--collapsed" : "topbar-right"}>
        <div className="topbar-right-menu">
          <div className={onlyIcons ? "topbar-right-menu-icon topbar-right-menu-icon--collapsed" : "topbar-right-menu-icon"}>
            <NotificationsIcon style={{ color: '#667085', cursor: 'pointer' }} />
            <div className="topbar-right-menu-user">
              <AccountCircleIcon style={{ color: '#667085', cursor: 'pointer' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div className="topbar-right-menu-user-name">
                  <span style={{ color: '#667085', fontSize: '14px' }}>Lucas Goncalves</span>
                </div>
                <div className="topbar-right-menu-user-role">
                  <span style={{ color: '#667085', fontSize: '12px' }}>Desenvolvedor</span>
                </div>
              </div>
              <KeyboardArrowDownIcon style={{ color: '#667085', cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Topbar
