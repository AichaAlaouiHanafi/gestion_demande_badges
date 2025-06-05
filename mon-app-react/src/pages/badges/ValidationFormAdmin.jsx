import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FormulaireDetail({ demande, onClose, onValider }) {
  const data = demande ? (typeof demande.formulaire === 'string' ? JSON.parse(demande.formulaire) : demande.formulaire) : null;
  if (!data) return null;
  return (
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
      <h3>Formulaire rempli</h3>
      <button onClick={onClose} style={{ float: 'right', marginTop: -10, marginRight: -10 }}>Fermer</button>
      <div style={{ marginTop: 30 }}>
        <div><b>Nom :</b> {data.nom}</div>
        <div><b>Prénom :</b> {data.prenom}</div>
        <div><b>Nationalité :</b> {data.nationalite}</div>
        <div><b>Filiation :</b> {data.filiation}</div>
        <div><b>Situation familiale :</b> {data.situationFamiliale}</div>
        <div><b>Nombre d'enfants :</b> {data.nbEnfants}</div>
        <div><b>Date et lieu de naissance :</b> {data.dateNaissance}</div>
        <div><b>N° C.L.N :</b> {data.cln}</div>
        <div><b>Date d'expiration :</b> {data.dateExpiration}</div>
        <div><b>N° Passeport :</b> {data.passport}</div>
        <div><b>Date de délivrance :</b> {data.dateDelivrance}</div>
        <div><b>Adresse :</b> {data.adresse}</div>
        <div><b>Ville :</b> {data.ville}</div>
        <div><b>Organisme :</b> {data.organisme}</div>
        <div><b>Fonction :</b> {data.fonction}</div>
        <div><b>Date de recrutement :</b> {data.dateRecrutement}</div>
        <div><b>Déjà eu un laissez-passer :</b> {data.dejaLaissezPasser}</div>
        <div><b>Type Laissez-Passer :</b> {data.typeLaissezPasser}</div>
        <div><b>N° Laissez-Passer :</b> {data.numLaissezPasser}</div>
        <div><b>Objet :</b> {data.objet}</div>
        <div><b>Zones sûreté :</b> {data.zonesSurete}</div>
        <div><b>Portes accès :</b> {data.portesAcces}</div>
        <div><b>Mode règlement :</b> {data.modeReglement}</div>
        <div><b>Date employeur :</b> {data.dateEmployeur}</div>
        <div><b>Date sûreté :</b> {data.dateSurete}</div>
        <div><b>Date gendarmerie :</b> {data.dateGendarmerie}</div>
        <div><b>Date directeur :</b> {data.dateDirecteur}</div>
        <div><b>N° dossier :</b> {data.numDossier}</div>
        <div><b>Secteurs :</b> {data.secteurs}</div>
        <div><b>Portes :</b> {data.portes}</div>
        <div><b>Fait le :</b> {data.dateFait}</div>
        <div><b>À :</b> {data.lieu}</div>
        <div><b>Signature du concerné :</b> {data.signatureConcerne}</div>
      </div>
    </div>
  );
}

const ValidationFormAdmin = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formulaireAffiche, setFormulaireAffiche] = useState(null);
  const [showRdvForm, setShowRdvForm] = useState(false);
  const [rdvDate, setRdvDate] = useState('');
  const [rdvTime, setRdvTime] = useState('');
  const [rdvDemandeId, setRdvDemandeId] = useState(null);
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8081/api/demandes', {
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

  if (loading) return <p>Chargement des demandes...</p>;

  // Log pour vérifier le contenu des demandes
  console.log('Demandes reçues côté admin:', demandes);

  return (
    <div>
      <h2>Liste de toutes les demandes</h2>
      {demandes.length === 0 ? (
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
            </tr>
          </thead>
          <tbody>
            {demandes.map(demande => (
              <tr key={demande.id}>
                <td>{demande.id}</td>
                <td>{demande.nomUtilisateur || ''}</td>
                <td>{demande.prenomUtilisateur || ''}</td>
                <td>{demande.type}</td>
                <td>
                  {demande.formulaire ? (
                    <button onClick={() => handleVoirFormulaire(demande)}>
                      Voir le formulaire
                    </button>
                  ) : (
                    <span>En attente de soumission</span>
                  )}
                </td>
                <td>
                  <span>{demande.statut}</span>
                  {/* Actions pour badge en attente */}
                  {demande.type === 'BADGE' && demande.statut === 'DEMANDE_INITIALE' && (
                    <>
                      <button onClick={() => handleValider(demande.id)}>Approuver</button>
                      <button onClick={() => handleRefuser(demande.id)} style={{marginLeft: 8, color: 'red'}}>Refuser</button>
                    </>
                  )}
                  {/* Actions pour badge formulaire rempli */}
                  {demande.type === 'BADGE' && demande.statut === 'FORMULAIRE_REMPLI' && (
                    <>
                      <button onClick={() => handleValiderFormulaire(demande.id)}>Approuver</button>
                      <button onClick={() => handleRefuser(demande.id)} style={{marginLeft: 8, color: 'red'}}>Refuser</button>
                    </>
                  )}
                  {/* Actions pour superAdmin */}
                  {role === 'SUPERADMIN' && demande.type === 'BADGE' && demande.statut === 'VALIDATION_ADMIN' && (
                    <>
                      <button onClick={() => handleValiderPourSuperAdmin(demande.id)}>Valider (superAdmin)</button>
                      <button onClick={() => handleRefuser(demande.id)} style={{marginLeft: 8, color: 'red'}}>Refuser</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Affichage du formulaire sélectionné */}
      <FormulaireDetail demande={formulaireAffiche} onClose={() => setFormulaireAffiche(null)} onValider={handleValider} />
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