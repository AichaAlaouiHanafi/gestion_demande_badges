// En option - modifiez votre AppLayout.jsx pour s'assurer qu'il utilise le rôle défini par l'URL

import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './AppLayoutStyle.css'; // Assurez-vous que ce fichier existe
import ProfileMenu from '../../components/layout/ProfileMenu';

const AppLayout = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Définir le rôle en fonction de l'URL (pour être sûr)
  let role = 'EMPLOYEE';
  if (path.startsWith('/admin')) {
    role = 'ADMIN';
  } else if (path.startsWith('/superadmin')) {
    role = 'SUPERADMIN';
  }
  
  // Mettre à jour localStorage pour être cohérent
  localStorage.setItem('role', role);
  
  const nom = localStorage.getItem('nom') || role;
  
  const baseItems = {
    EMPLOYEE: [
      { path: '/employee/badges', label: 'mes badges' },
      { path: '/employee/demandes', label: 'mes demandes' },
      { path: '/employee/rdvs', label: 'mes rendez vous' },
      { path: '/employee/notifications', label: 'mes notification' },
      { path: '/employee/profile', label: 'mon profil' }
    ],
    ADMIN: [
      { path: '/admin/badges', label: 'badges' },
      { path: '/admin/demandes', label: 'demandes' },
      { path: '/admin/rdvs', label: 'rendez vous' },
      { path: '/admin/notifications', label: 'notification' },
      { path: '/admin/utilisateurs', label: 'utilisateur' },
      { path: '/admin/inscription', label: 'inscription' },
      { path: '/admin/profile', label: 'mon profil' }
    ],
    SUPERADMIN: [
      { path: '/superadmin/badges', label: 'badges' },
      { path: '/superadmin/demandes', label: 'demandes' },
      { path: '/superadmin/rdvs', label: 'rendez vous' },
      { path: '/superadmin/notifications', label: 'notification' },
      { path: '/superadmin/utilisateurs', label: 'utilisateur' },
      
      { path: '/superadmin/departements', label: 'departement' },
      { path: '/superadmin/profile', label: 'mon profil' }
    ]
  };
  
  const menuItems = baseItems[role] || [];
  
  return (
    <div className="layout-container">
      <aside className="sidebar">
        <img src="/logo-ram.png" alt="Logo RAM" className="logo" />
        <nav className="menu">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      
      <header
        className="header"
        style={{
          position: 'fixed',
          top: 10,
          right: 5,
          width: 'auto',
          background: 'transparent',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '12px 32px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
         
          <ProfileMenu />
        </div>
      </header>
      <div className="page-content" style={{ marginTop: 60 }}>
        
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;