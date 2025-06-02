import React, { useEffect, useState } from 'react';

const SuperAdminRdvsPage = () => {
  const [rdvs, setRdvs] = useState([]);
  const token = localStorage.getItem('token');

  const fetchRdvs = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/rdvs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur lors du chargement des RDVs');
      const data = await response.json();
      setRdvs(data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des rendez-vous');
    }
  };

  useEffect(() => {
    fetchRdvs();
  }, [token]);

  const handleRemodifier = (rdvId) => {
    // Rediriger vers la page de modification
    window.location.href = `/superadmin/rdv/modifier/${rdvId}`;
  };

  const handleAccepter = async (rdvId) => {
    try {
      const response = await fetch(`http://localhost:8081/api/rdvs/confirmer/${rdvId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur lors de la confirmation');
      await fetchRdvs(); // Rafraîchir la liste
      alert('Rendez-vous confirmé avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la confirmation du rendez-vous');
    }
  };

  const handleRefuser = async (rdvId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir refuser ce rendez-vous ?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8081/api/rdvs/refuser/${rdvId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur lors du refus');
      await fetchRdvs(); // Rafraîchir la liste
      alert('Rendez-vous refusé avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du refus du rendez-vous');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Liste des rendez-vous</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Date proposée</th>
              <th style={styles.th}>Demande</th>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Prénom</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rdvs.map(rdv => (
              <tr key={rdv.id} style={styles.tr}>
                <td style={styles.td}>{rdv.id}</td>
                <td style={styles.td}>
                  {rdv.dateProposee ? new Date(rdv.dateProposee).toLocaleString('fr-FR', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  }) : ''}
                </td>
                <td style={styles.td}>{rdv.demandeId}</td>
                <td style={styles.td}>{rdv.nomEmploye}</td>
                <td style={styles.td}>{rdv.prenomEmploye}</td>
                <td style={styles.td}>{rdv.emailEmploye}</td>
                <td style={styles.td}>
                  {rdv.confirme ? "Confirmé" : rdv.modifie ? "Modifié" : "Proposé"}
                </td>
                <td style={styles.td}>
                  {rdv.modifie && (
                    <>
                      <button 
                        onClick={() => handleRemodifier(rdv.id)}
                        style={styles.button}
                      >
                        Remodifier
                      </button>
                      <button 
                        onClick={() => handleAccepter(rdv.id)}
                        style={{...styles.button, backgroundColor: '#4CAF50'}}
                      >
                        Accepter
                      </button>
                      <button 
                        onClick={() => handleRefuser(rdv.id)}
                        style={{...styles.button, backgroundColor: '#f44336'}}
                      >
                        Refuser
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  th: {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #ddd',
  },
  tr: {
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  button: {
    margin: '0 4px',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    backgroundColor: '#2196F3',
  },
};

export default SuperAdminRdvsPage; 