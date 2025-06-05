import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || 'EMPLOYEE';

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8081/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notif) => {
    if (notif.type === 'BADGE_REQUEST') {
      navigate('/admin/demandes');
    } else if (notif.type === 'SIGNUP') {
      navigate('/admin/inscription');
    }
    // Ajoute d'autres types si besoin
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:8081/api/notifications/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotifications();
  };

  const handleDeleteAll = async () => {
    const token = localStorage.getItem('token');
    await axios.delete('http://localhost:8081/api/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotifications();
  };

  
  const filtrerNotifications = (notifications) => {
    if (!notifications) return [];
    console.log('[NOTIF] Notifications reçues:', notifications.length, notifications);
    if (role === 'EMPLOYEE') {
      const filtered = notifications.filter(n =>
        n.type === 'RAPPEL_DEPOT_RECUP' ||
        n.type === 'RAPPEL_RDV' ||
        n.type === 'BADGE_ACCEPTE_ADMIN' ||
        n.type === 'BADGE_ACCEPTE_SUPERADMIN'
      );
      console.log('[NOTIF] Notifications filtrées EMPLOYEE:', filtered.length, filtered);
      return filtered;
    }
    if (role === 'ADMIN') {
      // PAS de filtre sur userId !
      const filtered = notifications.filter(n =>
        n.type === 'BADGE_REQUEST' ||
        n.type === 'VALIDATION_COMPTE_EMPLOYE'
      );
      console.log('[NOTIF] Notifications filtrées ADMIN:', filtered.length, filtered);
      return filtered;
    }
    if (role === 'SUPERADMIN') {
      const filtered = notifications.filter(n =>
        n.type === 'DEMANDE_A_VALIDER_SUPERADMIN' ||
        n.type === 'RAPPEL_DEPOT_RECUP' ||
        n.type === 'MODIFICATION_RDV'
      );
      console.log('[NOTIF] Notifications filtrées SUPERADMIN:', filtered.length, filtered);
      return filtered;
    }
    return notifications;
  };
  
  const notificationsFiltrees = filtrerNotifications(notifications || []);
  return (
    <div style={{ padding: 24 }}>
      <h2>Notifications</h2>
      <button onClick={handleDeleteAll} disabled={notifications.length === 0}>Tout supprimer</button>
      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && notifications.length === 0 && <p>Aucune notification.</p>}
      <ul>
        {(notificationsFiltrees || []).map((notif, idx) => (
          <li
            key={notif.id || idx}
            style={{
              marginBottom: 16,
              borderBottom: '1px solid #eee',
              paddingBottom: 8,
              cursor: 'pointer',
              background: notif.type === 'RAPPEL_DEPOT_RECUP' ? '#fffbe6' : 'white',
              borderLeft: notif.type === 'RAPPEL_DEPOT_RECUP' ? '4px solid orange' : 'none'
            }}
            onClick={() => handleNotificationClick(notif)}
          >
            <strong>
              {notif.type === 'RAPPEL_DEPOT_RECUP'
                ? '⏰ Rappel badge'
                : notif.type === 'BADGE_REQUEST'
                ? 'Demande de badge'
                : notif.type === 'SIGNUP'
                ? 'Nouvelle inscription'
                : 'Notification'}
            </strong><br />
            {notif.message}<br />
            <small>{notif.date ? new Date(notif.date).toLocaleString() : ''}</small>
            <button onClick={e => { e.stopPropagation(); handleDelete(notif.id); }} style={{ marginLeft: 10 }}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationPage;
