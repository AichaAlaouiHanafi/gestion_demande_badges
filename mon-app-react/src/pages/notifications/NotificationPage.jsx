import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  return (
    <div style={{ padding: 24 }}>
      <h2>Notifications</h2>
      <button onClick={handleDeleteAll} disabled={notifications.length === 0}>Tout supprimer</button>
      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && notifications.length === 0 && <p>Aucune notification.</p>}
      <ul>
        {notifications.map((notif, idx) => (
          <li
            key={notif.id || idx}
            style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8, cursor: 'pointer' }}
            onClick={() => handleNotificationClick(notif)}
          >
            <strong>
              {notif.type === 'BADGE_REQUEST' ? 'Demande de badge' :
               notif.type === 'SIGNUP' ? 'Nouvelle inscription' : 'Notification'}
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
