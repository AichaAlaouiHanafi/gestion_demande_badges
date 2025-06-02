import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MesRendezVous = () => {
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user ? user.id : null;
  const token = localStorage.getItem('token');
  const [modifRdvId, setModifRdvId] = useState(null);
  const [nouvelleDate, setNouvelleDate] = useState('');
  const [nouvelleHeure, setNouvelleHeure] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRdvs = async () => {
      try {
        const response = await fetch(`http://localhost:8081/api/rdvs/utilisateur/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erreur lors du chargement des RDVs');
        const data = await response.json();
        setRdvs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRdvs();
  }, [userId, token]);

  const handleConfirmer = async (rdvId) => {
    try {
      const response = await fetch(`http://localhost:8081/api/rdvs/confirmer/${rdvId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur lors de la confirmation');
      
      setRdvs(rdvs => rdvs.map(r => 
        r.id === rdvId ? { ...r, statut: 'CONFIRME' } : r
      ));
      alert('Rendez-vous confirmé avec succès !');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDemanderModification = (rdvId) => {
    setModifRdvId(rdvId);
  };

  const handleSubmitModification = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8081/api/rdvs/modifier`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rdvId: modifRdvId,
          nouvelleDate: `${nouvelleDate}T${nouvelleHeure}`,
          motif: "Modification demandée par l'employé"
        })
      });
      
      if (!response.ok) throw new Error('Erreur lors de la modification');
      
      setRdvs(rdvs => rdvs.map(r => 
        r.id === modifRdvId ? { 
          ...r, 
          statut: 'MODIFICATION_DEMANDEE',
          dateProposee: `${nouvelleDate}T${nouvelleHeure}`
        } : r
      ));
      
      setModifRdvId(null);
      setNouvelleDate('');
      setNouvelleHeure('');
      alert('Demande de modification envoyée au superAdmin !');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Chargement des rendez-vous...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Mes rendez-vous</h2>
      {rdvs.length === 0 ? (
        <p>Aucun rendez-vous trouvé.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={styles.th}>Date proposée</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rdvs.map(rdv => (
                <tr key={rdv.id} style={styles.tr}>
                  <td style={styles.td}>
                    {rdv.dateProposee ? new Date(rdv.dateProposee).toLocaleString('fr-FR', {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    }) : 'Non défini'}
                  </td>
                  <td style={styles.td}>
                    {rdv.confirme
                      ? "Confirmé"
                      : rdv.modifie
                        ? "Modifié"
                        : "Proposé"
                    }
                  </td>
                  <td style={styles.td}>
                    {!rdv.confirme && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => handleConfirmer(rdv.id)}
                          style={styles.button.confirmer}
                        >
                          Confirmer
                        </button>
                        <button 
                          onClick={() => handleDemanderModification(rdv.id)}
                          style={styles.button.modifier}
                        >
                          Demander modification
                        </button>
                      </div>
                    )}
                    {modifRdvId === rdv.id && (
                      <form onSubmit={handleSubmitModification} style={styles.form}>
                        <div style={styles.formGroup}>
                          <input
                            type="date"
                            value={nouvelleDate}
                            onChange={e => setNouvelleDate(e.target.value)}
                            required
                            style={styles.input}
                          />
                          <input
                            type="time"
                            value={nouvelleHeure}
                            onChange={e => setNouvelleHeure(e.target.value)}
                            required
                            style={styles.input}
                          />
                        </div>
                        <div style={styles.formButtons}>
                          <button type="submit" style={styles.button.submit}>
                            Envoyer
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setModifRdvId(null)}
                            style={styles.button.cancel}
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  th: {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
    backgroundColor: '#f5f5f5'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #ddd'
  },
  tr: {
    '&:hover': {
      backgroundColor: '#f9f9f9'
    }
  },
  button: {
    confirmer: {
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#45a049'
      }
    },
    modifier: {
      backgroundColor: '#2196F3',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#1976D2'
      }
    },
    submit: {
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    cancel: {
      backgroundColor: '#f44336',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      marginLeft: '8px'
    }
  },
  form: {
    marginTop: '10px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9'
  },
  formGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px'
  },
  input: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    flex: 1
  },
  formButtons: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
};

const getStatusStyle = (statut) => {
  const styles = {
    PROPOSE: { color: '#2196F3', fontWeight: 'bold' },
    CONFIRME: { color: '#4CAF50', fontWeight: 'bold' },
    MODIFICATION_DEMANDEE: { color: '#FF9800', fontWeight: 'bold' },
    ANNULE: { color: '#f44336', fontWeight: 'bold' }
  };
  return styles[statut] || {};
};

const getStatusLabel = (statut) => {
  const labels = {
    PROPOSE: 'Proposé',
    CONFIRME: 'Confirmé',
    MODIFICATION_DEMANDEE: 'Modification demandée',
    ANNULE: 'Annulé'
  };
  return labels[statut] || statut;
};

export default MesRendezVous; 