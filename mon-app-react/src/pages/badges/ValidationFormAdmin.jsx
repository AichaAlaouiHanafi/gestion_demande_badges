import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DemandeBadgeForm from './DemandeBadgeForm';
import DepotBadgeForm from './DepotBadgeForm';
import RecuperationBadgeForm from './RecuperationBadgeForm';

const ValidationFormAdmin = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formulaireAffiche, setFormulaireAffiche] = useState(null);
  const [showRdvForm, setShowRdvForm] = useState(false);
  const [rdvDate, setRdvDate] = useState('');
  const [rdvTime, setRdvTime] = useState('');
  const [rdvDemandeId, setRdvDemandeId] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || localStorage.getItem('role');
  const departementId = user?.departement?.id;
  const [utilisateurs, setUtilisateurs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        const token = localStorage.getItem('token');
        let url = 'http://localhost:8081/api/demandes';
        if (role === 'ADMIN') {
          url = 'http://localhost:8081/api/demandes/par-departement';
        }
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setDemandes(Array.isArray(data) ? data : []);
        console.log('Données reçues:', data);
      } catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
        setDemandes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDemandes();
    // Récupérer tous les utilisateurs pour le filtrage par département
    const fetchUtilisateurs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8081/api/utilisateurs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setUtilisateurs(Array.isArray(data) ? data : []);
      } catch (error) {
        setUtilisateurs([]);
      }
    };
    fetchUtilisateurs();
  }, []);

  const handleValider = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8081/api/demandes/valider/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setDemandes(demandes => demandes.map(d =>
        d.id === id ? { ...d, statut: 'VALIDATION_ADMIN' } : d
      ));
      setFormulaireAffiche(null);
    } catch (error) {
      alert("Erreur lors de la validation.");
    }
  };

  const handleValiderPourSuperAdmin = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8081/api/demandes/valider/superadmin/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setDemandes(demandes => demandes.map(d =>
        d.id === id ? { ...d, statut: 'VALIDATION_SUPERADMIN' } : d
      ));
      setFormulaireAffiche(null);
      navigate(`/superadmin/rdv/proposer/${id}`);
    } catch (error) {
      console.error('Erreur lors de la validation superadmin:', error);
      alert("Erreur lors de la validation superadmin.");
    }
  };

  const handleRdvSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8081/api/rdvs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          demandeId: rdvDemandeId,
          date: rdvDate,
          heure: rdvTime
        })
      });
      alert('Rendez-vous proposé à l\'employé !');
      setShowRdvForm(false);
      setRdvDate('');
      setRdvTime('');
      setRdvDemandeId(null);
    } catch (error) {
      alert("Erreur lors de la proposition du rendez-vous.");
    }
  };

  const handleRejeter = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8081/api/demandes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setDemandes(demandes => demandes.filter(d => d.id !== id));
    } catch (error) {
      alert("Erreur lors du rejet.");
    }
  };

  const handleVoirFormulaire = (demande) => {
    setFormulaireAffiche(demande);
  };

  const handleValiderFormulaire = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8081/api/demandes/valider-formulaire/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setDemandes(demandes => demandes.map(d =>
        d.id === id ? { ...d, statut: 'VALIDATION_ADMIN' } : d
      ));
    } catch (error) {
      alert("Erreur lors de la validation du formulaire.");
    }
  };

  const handleRefuser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8081/api/demandes/${id}/refuser`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setDemandes(demandes => demandes.map(d =>
        d.id === id ? { ...d, statut: 'REFUSEE' } : d
      ));
    } catch (error) {
      alert("Erreur lors du refus.");
    }
  };

  // Fonction pour télécharger le zip
  const handleDownloadZip = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/demandes/${id}/download-zip`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur lors du téléchargement du zip');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `demande_${id}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur lors du téléchargement du dossier complet.');
    }
  };

  // Filtrer les demandes par département pour l'admin
  const demandesFiltrees = demandes.filter(d => {
    if (role === 'ADMIN' && departementId && utilisateurs.length > 0) {
      const userDemande = utilisateurs.find(u => u.id === d.utilisateurId);
      return userDemande && userDemande.departementId === departementId;
    }
    return true;
  });

  if (loading) return <p>Chargement des demandes...</p>;

  // Log pour vérifier le contenu des demandes
  console.log('Demandes reçues côté admin:', demandesFiltrees);

  return (
    <div className="main-content" style={{ padding: '20px' }}>
      <h2>Liste de toutes les demandes</h2>
      {demandesFiltrees.length === 0 ? (
        <p>Aucune demande trouvée.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Type</th>
              <th>Formulaire</th>
              <th>Statut</th>
              {/* Afficher la colonne Actions pour l'admin et le superadmin */}
              {(role === 'ADMIN' || role === 'SUPERADMIN') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {demandesFiltrees.map(demande => (
              <tr key={demande.id}>
                <td>{demande.id}</td>
                <td>{demande.nomUtilisateur || ''}</td>
                <td>{demande.prenomUtilisateur || ''}</td>
                <td>{demande.type}</td>
                <td>
                  {demande.type === 'BADGE' && demande.formulaire ? (
                    <button onClick={() => handleVoirFormulaire(demande)}>
                      Voir le formulaire
                    </button>
                  ) : demande.type === 'BADGE' && !demande.formulaire ? (
                    <span>En attente de soumission</span>
                  ) : (
                    <span>-</span>
                  )}
                </td>
                <td>
                  <span>{demande.statut}</span>
                </td>
                {/* Afficher les actions pour l'admin et le superadmin */}
                {(role === 'ADMIN' || role === 'SUPERADMIN') && (
                  <td>
                    {/* Actions pour badge en attente */}
                    {demande.type === 'BADGE' && demande.statut === 'DEMANDE_INITIALE' && (
                      <>
                        <button onClick={() => handleValider(demande.id)}>Approuver</button>
                        <button onClick={() => handleRefuser(demande.id)} style={{marginLeft: 8, color: 'red'}}>Refuser</button>
                        <button onClick={() => handleDownloadZip(demande.id)} style={{marginLeft: 8}}>Télécharger le dossier complet</button>
                      </>
                    )}
                    {/* Actions pour badge formulaire rempli */}
                    {demande.type === 'BADGE' && demande.statut === 'FORMULAIRE_REMPLI' && (
                      <>
                        <button onClick={() => handleValiderFormulaire(demande.id)}>Approuver</button>
                        <button onClick={() => handleRefuser(demande.id)} style={{marginLeft: 8, color: 'red'}}>Refuser</button>
                        <button onClick={() => handleDownloadZip(demande.id)} style={{marginLeft: 8}}>Télécharger le dossier complet</button>
                      </>
                    )}
                    {/* Actions pour superAdmin */}
                    {role === 'SUPERADMIN' && demande.type === 'BADGE' && demande.statut === 'VALIDATION_ADMIN' && (
                      <>
                        <button onClick={() => handleValiderPourSuperAdmin(demande.id)}>Valider (superAdmin)</button>
                        <button onClick={() => handleRefuser(demande.id)} style={{marginLeft: 8, color: 'red'}}>Refuser</button>
                        <button onClick={() => handleDownloadZip(demande.id)} style={{marginLeft: 8}}>Télécharger le dossier complet</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Affichage du formulaire sélectionné */}
      {formulaireAffiche && (
        <div style={{
          position: 'fixed',
          top: 80,
          right: 40,
          width: 400,
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: 8,
          boxShadow: '0 2px 8px #0002',
          padding: 24,
          zIndex: 1000
        }}>
          <button onClick={() => setFormulaireAffiche(null)} style={{ float: 'right', marginTop: -10, marginRight: -10 }}>Fermer</button>
          <h3>Formulaire rempli</h3>
          {formulaireAffiche.type === 'BADGE' && (
            <DemandeBadgeForm data={formulaireAffiche} readOnly />
          )}
          {formulaireAffiche.type === 'DEPOT' && (
            <DepotBadgeForm data={formulaireAffiche} readOnly />
          )}
          {formulaireAffiche.type === 'RECUPERATION' && (
            <RecuperationBadgeForm data={formulaireAffiche} readOnly />
          )}
        </div>
      )}
      {/* Formulaire de proposition de RDV après validation superadmin */}
      {showRdvForm && (
        <div style={{
          position: 'fixed', top: 120, right: 40, width: 400, background: '#fff', border: '1px solid #ccc', borderRadius: 8, boxShadow: '0 2px 8px #0002', padding: 24, zIndex: 1100
        }}>
          <h3>Proposer un rendez-vous</h3>
          <form onSubmit={handleRdvSubmit}>
            <label>Date du RDV :<br />
              <input type="date" value={rdvDate} onChange={e => setRdvDate(e.target.value)} required style={{width:'100%'}} />
            </label><br /><br />
            <label>Heure du RDV :<br />
              <input type="time" value={rdvTime} onChange={e => setRdvTime(e.target.value)} required style={{width:'100%'}} />
            </label><br /><br />
            <button type="submit" style={{background:'#4CAF50',color:'white',border:'none',borderRadius:4,padding:'10px 20px'}}>Envoyer la proposition</button>
            <button type="button" onClick={()=>setShowRdvForm(false)} style={{marginLeft:10}}>Annuler</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ValidationFormAdmin;