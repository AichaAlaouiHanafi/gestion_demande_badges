import React, { useEffect, useState } from 'react';
import DemandeBadgeForm from './DemandeBadgeForm';
import DepotBadgeForm from './DepotBadgeForm';
import RecuperationBadgeForm from './RecuperationBadgeForm';

const types = [
  { value: '', label: 'Tous les types' },
  { value: 'BADGE', label: 'Badge' },
  { value: 'DEPOT', label: 'Dépôt de badge' },
  { value: 'RECUPERATION', label: 'Récupération de badge' },
];

const ListeDemandes = () => {
  console.log("Composant ListeDemandes monté !");
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreType, setFiltreType] = useState('');
  const [typeDemande, setTypeDemande] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDepotForm, setShowDepotForm] = useState(false);
  const [showRecupForm, setShowRecupForm] = useState(false);

  // Définition de fetchDemandes accessible partout
  const fetchDemandes = async () => {
    setLoading(true);
    console.log("fetchDemandes appelé !");
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/demandes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("Réponse GET reçue :", response);
      if (!response.ok) {
        throw new Error('Erreur API: ' + response.status);
      }
      const data = await response.json();
      console.log("Données reçues :", data);
      setDemandes(Array.isArray(data) ? data : []);
    } catch (error) {
      setDemandes([]);
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setLoading(false);
      console.log("setLoading(false) exécuté");
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const handleStart = () => setShowForm(true);

  if (loading) return <p>Chargement des demandes...</p>;

  // Filtrage par type
  const demandesFiltrees = filtreType
    ? demandes.filter(d => d.type === filtreType)
    : demandes;

  // Chercher la demande de badge en cours
  const demandeBadgeEnCours = demandes.find(
    d => d.type === 'BADGE' && (
      d.statut === 'DEMANDE_INITIALE' ||
      d.statut === 'EN_ATTENTE_FORMULAIRE' ||
      d.statut === 'VALIDATION_ADMIN' ||
      d.statut === 'FORMULAIRE_A_REMPLIR'
    )
  );

  // Fonction pour initier une demande simple (étape 1)
  const handleDemandeSimple = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8081/api/demandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: typeDemande })
      });
      setLoading(true); // Pour rafraîchir la liste
      // Optionnel : afficher un message temporaire
    } catch (error) {
      alert("Erreur lors de la création de la demande.");
    }
  };

  // Handler pour dépôt
  const handleDepotSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('http://localhost:8081/api/demandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'DEPOT',
          utilisateurId: user.id,
          formulaire: JSON.stringify(formData)
        })
      });
      const data = await response.json();
      await fetchDemandes();
      setShowDepotForm(false);
      setShowRecupForm(false);
      // Sélectionne la nouvelle demande pour affichage immédiat
      setTypeDemande('DEPOT');
    } catch (error) {
      console.error('Erreur lors de la création de la demande de dépôt:', error);
      alert("Erreur lors de la création de la demande de dépôt.");
      setLoading(false);
    }
  };

  // Handler pour récupération
  const handleRecupSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('http://localhost:8081/api/demandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'RECUPERATION',
          utilisateurId: user.id,
          formulaire: JSON.stringify(formData)
        })
      });
      const data = await response.json();
      await fetchDemandes();
      setShowRecupForm(false);
      setTypeDemande('RECUPERATION');
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la création de la demande de récupération:', error);
      alert("Erreur lors de la création de la demande de récupération.");
    }
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || localStorage.getItem('role');

  return (
    <div style={{ display: 'flex', gap: 40 }}>
      {/* Colonne gauche : liste des demandes */}
      <div style={{ flex: 2 }}>
        <h2>Liste des demandes</h2>
        <div style={{ marginBottom: 20 }}>
          <label>Filtrer par type : </label>
          <select value={filtreType} onChange={e => setFiltreType(e.target.value)}>
            {types.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
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
                    {demande.formulaire ? (
                      <button disabled style={{ opacity: 0.7 }}>
                        Voir le formulaire
                      </button>
                    ) : (
                      <span>En attente de soumission</span>
                    )}
                  </td>
                  <td>
                    <span>{demande.statut}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Colonne droite : workflow métier corrigé */}
      <div style={{ flex: 1, background: '#fff', padding: 20, borderRadius: 8, minWidth: 350 }}>
        <h3>Nouvelle demande</h3>
        {role !== 'SUPERADMIN' && (
          <>
            {typeDemande === '' && (
              <div>
                <label>Type de demande : </label>
                <select value={typeDemande} onChange={e => setTypeDemande(e.target.value)}>
                  <option value="">-- Choisir --</option>
                  <option value="BADGE">Demande de badge</option>
                  <option value="DEPOT">Dépôt de badge</option>
                  <option value="RECUPERATION">Récupération de badge</option>
                </select>
              </div>
            )}
            {/* LOGIQUE BADGE */}
            {typeDemande === 'BADGE' && (
              !demandeBadgeEnCours ? (
                <button onClick={handleDemandeSimple}>Faire une demande de badge</button>
              ) : (demandeBadgeEnCours.statut === 'FORMULAIRE_A_REMPLIR' || demandeBadgeEnCours.statut === 'EN_ATTENTE_FORMULAIRE') ? (
                <DemandeBadgeForm typeDemande="BADGE" demandeId={demandeBadgeEnCours.id} />
              ) : (
                <div style={{ color: 'green', marginTop: 20 }}>
                  Votre demande a été transmise à l'admin. Vous serez notifié après validation.<br/>
                  (Le formulaire s'affichera ici après validation de l'admin)
                </div>
              )
            )}
            {/* LOGIQUE DEPOT */}
            {typeDemande === 'DEPOT' && (
              showDepotForm ? (
                <DepotBadgeForm onSubmit={handleDepotSubmit} />
              ) : (
                <button onClick={() => setShowDepotForm(true)}>Faire une demande de dépôt</button>
              )
            )}
            {/* LOGIQUE RECUPERATION */}
            {typeDemande === 'RECUPERATION' && (
              showRecupForm ? (
                <RecuperationBadgeForm onSubmit={handleRecupSubmit} />
              ) : (
                <button onClick={() => setShowRecupForm(true)}>Faire une demande de récupération</button>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListeDemandes; 