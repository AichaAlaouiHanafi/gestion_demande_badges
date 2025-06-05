import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [hasNewNotif, setHasNewNotif] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Récupérer les notifications à la connexion
  useEffect(() => {
    const fetchNotifs = async () => {
      const token = localStorage.getItem('token');
      if (!user.id || !token) return;
      const res = await axios.get(`http://localhost:8081/api/notifications/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let notifs = res.data || [];
      // Trie par date décroissante pour avoir les plus récentes en premier
      let newNotifs = [...notifs].sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentNotifs(newNotifs.slice(0, 2));
      setHasNewNotif(newNotifs.length > 0);
    };
    fetchNotifs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16, marginLeft: 20 }}>
      {/* Icône notification */}
      <span style={{ position: 'relative', marginRight: 12 }}>
        <i
          className="fa fa-bell"
          style={{
            fontSize: 28,
            color: '#b00',
            cursor: 'pointer',
            animation: hasNewNotif ? 'notif-blink 1s infinite' : 'none'
          }}
          onClick={() => setNotifOpen(!notifOpen)}
        />
        {hasNewNotif && (
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 12,
            height: 12,
            background: '#b00',
            borderRadius: '50%',
            border: '2px solid #fff'
          }} />
        )}
        {/* Menu notifications */}
        {notifOpen && (
          <div style={{
            position: 'absolute',
            top: 36,
            right: 0,
            left: 'auto',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: 12,
            minWidth: 220,
            zIndex: 2000
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Nouvelles notifications</div>
            {recentNotifs.length === 0 && <div>Aucune notification récente.</div>}
            {recentNotifs.map((n, i) => (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: i < recentNotifs.length - 1 ? '1px solid #eee' : 'none' }}>
                <div style={{ fontWeight: 500, color: '#800' }}>
                  {n.type === 'RAPPEL_RDV' ? '⏰ Rappel rendez-vous' :
                   n.type === 'BADGE_REQUEST' ? 'Demande de badge' :
                   n.type === 'BADGE_ACCEPTE_ADMIN' ? 'Badge accepté (admin)' :
                   n.type === 'BADGE_ACCEPTE_SUPERADMIN' ? 'Badge accepté (superadmin)' :
                   n.type === 'DEMANDE_A_VALIDER_SUPERADMIN' ? 'À valider (superadmin)' :
                   n.type === 'SIGNUP' ? 'Nouvelle inscription' :
                   n.type === 'RDV_REFUSE' ? 'RDV refusé' :
                   n.type === 'MODIFICATION_RDV' ? 'Modification RDV' :
                   n.type === 'RAPPEL_DEPOT_RECUP' ? '⏰ Rappel dépôt/récup' :
                   'Notification'}
                </div>
                <div style={{ fontSize: 13 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{n.date ? new Date(n.date).toLocaleString('fr-FR') : ''}</div>
              </div>
            ))}
          </div>
        )}
      </span>
      {/* Icône profil */}
      <img
        src="data:image/jpeg;base64,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"
        alt="Profil"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          cursor: 'pointer',
          border: '2px solid #b00',
          background: '#fff',
          objectFit: 'cover'
        }}
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div style={{
          position: 'absolute',
          top: 40,
          right: 0,
          left: 'auto',
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          padding: 16,
          minWidth: 200,
          zIndex: 1000
        }}>
          <div style={{ marginBottom: 12, fontWeight: 'bold', color: '#b00' }}>
            {user.email || 'Email inconnu'}
          </div>
          <button onClick={handleLogout} style={{
            background: '#b00',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            cursor: 'pointer'
          }}>
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu; 