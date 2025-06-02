import React, { useEffect, useState } from 'react';

const steps = [
  { key: 'DEMANDE_INITIALE', label: 'Demande initiale' },
  { key: 'VALIDATION_ADMIN', label: 'Validation Admin' },
  { key: 'FORMULAIRE_REMPLI', label: 'Formulaire rempli' },
  { key: 'VALIDATION_SUPERADMIN', label: 'Validation SuperAdmin' },
  { key: 'RDV_PROPOSE', label: 'Proposition de RDV' },
  { key: 'RDV_MODIFIE', label: 'Modification de RDV' },
  { key: 'RDV_CONFIRME', label: 'Confirmation du RDV' },
  { key: 'NOTIF_CONFIRMATION', label: 'Notification de confirmation' },
  { key: 'RAPPEL_RDV', label: 'Rappel automatique' },
  { key: 'RECUPERATION_CONFIRME', label: 'Confirmation de récupération' },
  { key: 'DEPOT_DEMANDE', label: 'Demande de dépôt du badge' },
  { key: 'RECUPERATION_DEMANDE', label: 'Demande de récupération du badge' }
];

const ListeBadgesEmploye = () => {
  const [badges, setBadges] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Récupère les demandes de badge de l'employé
    fetch('http://localhost:8081/api/demandes/mes-demandes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setDemandes);
    // Récupère les badges (optionnel)
    fetch('http://localhost:8081/api/badges', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setBadges);
  }, [token]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Mes badges et suivi</h2>
      {demandes.length === 0 ? (
        <p>Aucune demande de badge trouvée.</p>
      ) : (
        demandes.map((demande) => (
          <div key={demande.id} style={{ marginBottom: 40, border: '1px solid #ddd', borderRadius: 8, padding: 20 }}>
            <h4>Demande #{demande.id}</h4>
            <Roadmap statut={demande.statut} />
            {badges.filter(b => b.utilisateurId === demande.utilisateurId).length > 0 && (
              <div style={{ marginTop: 10, color: 'green' }}>Badge attribué : {badges.find(b => b.utilisateurId === demande.utilisateurId).numero}</div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

function Roadmap({ statut }) {
  // Détermine l'étape atteinte
  const currentStep = steps.findIndex(s => s.key === statut);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0', flexWrap: 'wrap' }}>
      {steps.map((step, idx) => (
        <React.Fragment key={step.key}>
          <div style={{
            padding: '8px 16px',
            borderRadius: 20,
            background: idx <= currentStep ? '#4CAF50' : '#f44336',
            color: 'white',
            fontWeight: 'bold',
            minWidth: 120,
            textAlign: 'center',
            border: idx === currentStep ? '2px solid #222' : 'none',
            opacity: idx <= currentStep ? 1 : 0.5
          }}>
            {step.label}
          </div>
          {idx < steps.length - 1 && (
            <span style={{ fontSize: 24, color: idx < currentStep ? '#4CAF50' : '#ccc' }}>→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default ListeBadgesEmploye;
