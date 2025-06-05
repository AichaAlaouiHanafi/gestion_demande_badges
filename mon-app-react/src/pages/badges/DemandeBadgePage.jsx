import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DemandeBadgeForm from './DemandeBadgeForm';
import DepotBadgeForm from './DepotBadgeForm';
import RecuperationBadgeForm from './RecuperationBadgeForm';
//import ListeDemandes from './ListeDemandes';
const types = [
  { value: 'BADGE', label: 'Demande de badge' },
  { value: 'DEPOT', label: 'Dépôt de badge' },
  { value: 'RECUPERATION', label: 'Récupération de badge' },
];

const DemandeBadgePage = () => {
  console.log("DemandeBadgePage monté !");
  const [demandeId, setDemandeId] = useState(null);
  const [demandeType, setDemandeType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeDemande, setTypeDemande] = useState('BADGE');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [statut, setStatut] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || localStorage.getItem('role');

  useEffect(() => {
    const fetchDemandeEnCours = async () => {
      try {
        console.log("Début fetchDemandeEnCours");
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8081/api/demandes/mes-demandes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Réponse reçue :", response.data);
        // Priorité : VALIDATION_ADMIN > DEMANDE_INITIALE > REFUSEE pour le type sélectionné
        let demandeEnCours = response.data.find(d => d.type === typeDemande && d.statut === 'VALIDATION_ADMIN');
        if (!demandeEnCours) {
          demandeEnCours = response.data.find(d => d.type === typeDemande && d.statut === 'DEMANDE_INITIALE');
        }
        if (!demandeEnCours) {
          demandeEnCours = response.data.find(d => d.type === typeDemande && d.statut === 'REFUSEE');
        }
        if (demandeEnCours) {
          setDemandeId(demandeEnCours.id);
          setDemandeType(demandeEnCours.type);
          setStatut(demandeEnCours.statut);
          // Afficher le formulaire dès qu'une demande existe
          setShowForm(true);
        }
      } catch (err) {
        setError("Erreur lors du chargement de vos demandes");
        console.error("Erreur fetchDemandeEnCours :", err);
      } finally {
        setLoading(false);
        console.log("setLoading(false) exécuté");
      }
    };
    fetchDemandeEnCours();
  }, [typeDemande]);

  const handleNouvelleDemande = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.post('http://localhost:8081/api/demandes', {
        type: typeDemande,
        utilisateurId: user.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDemandeId(response.data.demande.id);
      setDemandeType(typeDemande);
      // On ne montre pas le formulaire immédiatement
      setShowForm(true);
      setError(null);
      // Afficher un message de confirmation
      //setMessage("Votre demande a été transmise à l'administrateur. Vous recevrez une notification une fois la demande validée.");
    } catch (err) {
      setError("Erreur lors de la création de la demande");
      console.error("Erreur handleNouvelleDemande:", err);
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.post('http://localhost:8081/api/demandes', {
        formulaire: JSON.stringify(formData),
        type: typeDemande,
        utilisateurId: user.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDemandeId(response.data.demande?.id || response.data.id);
      setError(null);
      setTypeDemande('');
      setShowForm(false);
      //setTypeDemande('BADGE');
    } catch (err) {
      setError("Erreur lors de la création de la demande");
    }
  };

  if (role === 'SUPERADMIN') {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'gray' }}>
        Les superAdmin ne peuvent pas créer de demande.
      </div>
    );
  }

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // Si la demande a été refusée
  if (demandeId && demandeType === 'BADGE' && statut === 'REFUSEE') {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
        Votre demande de badge a été refusée par l'administrateur.
      </div>
    );
  }

  // Si une demande de badge existe mais n'est pas encore validée
  if (demandeId && demandeType === 'BADGE' && !showForm) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h3>Demande en cours de traitement</h3>
        <p>Votre demande de badge est en attente de validation par l'administrateur.</p>
        <p>Vous recevrez une notification une fois la demande validée.</p>
      </div>
    );
  }

  // Si une demande de badge est validée, afficher le formulaire
  if (demandeId && demandeType === 'BADGE' && showForm) {
    return <DemandeBadgeForm demandeId={demandeId} typeDemande={demandeType} />;
  }

  // Si une demande de dépôt est validée, afficher le formulaire de dépôt
  if (demandeId && demandeType === 'DEPOT' && showForm) {
    return <DepotBadgeForm demandeId={demandeId} typeDemande={demandeType} />;
  }

  // Si une demande de récupération est validée, afficher le formulaire de récupération
  if (demandeId && demandeType === 'RECUPERATION' && showForm) {
    return <RecuperationBadgeForm demandeId={demandeId} typeDemande={demandeType} />;
  }

  // Si aucune demande en cours, afficher le formulaire de démarrage
  if (!demandeId) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h2>Nouvelle demande</h2>
        <label>Type de demande : </label>
        <select value={typeDemande} onChange={e => setTypeDemande(e.target.value)} style={{ marginRight: 10 }}>
          {types.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {typeDemande === 'BADGE' && (
          <button 
            onClick={handleNouvelleDemande}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Démarrer la demande
          </button>
        )}
        {typeDemande === 'DEPOT' && (
          <DepotBadgeForm onSubmit={handleSubmitForm} />
        )}
        {typeDemande === 'RECUPERATION' && (
          <RecuperationBadgeForm onSubmit={handleSubmitForm} />
        )}
        {message && <p style={{ marginTop: '20px', color: 'green' }}>{message}</p>}
      </div>
    );
  }

  return null;
};

export default DemandeBadgePage; 