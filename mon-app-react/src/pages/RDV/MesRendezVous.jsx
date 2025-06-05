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
  const [delaiRappel, setDelaiRappel] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les RDV de badge
        const rdvResponse = await fetch(`http://localhost:8081/api/rdvs/utilisateur/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!rdvResponse.ok) throw new Error('Erreur lors du chargement des RDVs');
        const rdvData = await rdvResponse.json();

        // Récupérer les demandes de dépôt et récupération
        const demandesResponse = await fetch(`http://localhost:8081/api/demandes/mes-demandes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!demandesResponse.ok) throw new Error('Erreur lors du chargement des demandes');
        const demandesData = await demandesResponse.json();

        // Afficher toutes les demandes de dépôt/récupération ayant une date souhaitée
        const demandesDepotRecup = demandesData.filter(d => 
          (d.type === 'DEPOT' || d.type === 'RECUPERATION') &&
          d.formulaire && JSON.parse(d.formulaire).dateSouhaitee
        );

        // Convertir les demandes en format RDV
        const rdvsDepotRecup = demandesDepotRecup.map(d => {
          const formulaire = JSON.parse(d.formulaire);
          return {
            id: d.id,
            dateProposee: `${formulaire.dateSouhaitee}T${formulaire.creneau ? (formulaire.creneau === '9h-12h' ? '09:00' : '14:00') : (formulaire.heureSouhaitee || '09:00')}`,
            confirme: true,
            type: d.type,
            formulaire: formulaire,
            delaiRappel: d.delaiRappel || null,
            statut: d.statut
          };
        });

        // Combiner les RDV de badge avec les RDV de dépôt/récupération
        setRdvs([...rdvData, ...rdvsDepotRecup]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const handleConfigurerRappel = async (rdvId, delai) => {
    try {
      // Chercher le rdv dans la liste pour savoir si c'est un dépôt/récup ou badge
      const rdv = rdvs.find(r => r.id === rdvId);
      let url = '';
      if (rdv && (rdv.type === 'DEPOT' || rdv.type === 'RECUPERATION')) {
        url = `http://localhost:8081/api/demandes/${rdvId}/rappel`;
      } else {
        url = `http://localhost:8081/api/rdvs/${rdvId}/rappel`;
      }
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ delaiRappel: delai })
      });

      if (!response.ok) throw new Error('Erreur lors de la configuration du rappel');
      setRdvs(rdvs => rdvs.map(r => 
        r.id === rdvId ? { ...r, delaiRappel: delai } : r
      ));
      alert('Configuration du rappel enregistrée !');
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
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Date proposée</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Rappel</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rdvs.map(rdv => (
                <tr key={rdv.id} style={styles.tr}>
                  <td style={styles.td}>
                    {rdv.type === 'DEPOT' ? 'Dépôt de badge' :
                     rdv.type === 'RECUPERATION' ? 'Récupération de badge' :
                     'Badge'}
                  </td>
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
                        : rdv.statut === 'RDV_CONFIRME' ? 'Confirmé' : rdv.statut || "Proposé"
                    }
                  </td>
                  <td style={styles.td}>
                    {rdv.confirme && rdv.delaiRappel ? (
                      <span>
                        {rdv.delaiRappel === 2 && '2 heures avant'}
                        {rdv.delaiRappel === 24 && '1 jour avant'}
                        {rdv.delaiRappel === 48 && '2 jours avant'}
                      </span>
                    ) : rdv.confirme && (
                      <select
                        value={rdv.delaiRappel || ''}
                        onChange={(e) => handleConfigurerRappel(rdv.id, parseInt(e.target.value))}
                        style={{
                          padding: '5px',
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                      >
                        <option value="">Choisir un délai</option>
                        <option value="2">2 heures avant</option>
                        <option value="24">1 jour avant</option>
                        <option value="48">2 jours avant</option>
                      </select>
                    )}
                  </td>
                  <td style={styles.td}>
                    {!rdv.confirme && !rdv.type && (
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
                    {modifRdvId === rdv.id && !rdv.type && (
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