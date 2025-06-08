import React, { useState } from 'react';
import jsPDF from 'jspdf';

const initialData = {
  // Étape 1
  nom: '',
  prenom: '',
  nationalite: '',
  filsDe: '',
  ben: '',
  etDe: '',
  bent: '',
  situationFamiliale: '',
  nombreEnfants: '',
  dateNaissance: '',
  lieuNaissance: '',
  numCIN: '',
  dateExpirationCIN: '',
  numPasseport: '',
  dateDelivrancePasseport: '',
  adresse: '',
  ville: '',
  // Étape 2
  organisme: '',
  fonction: '',
  dateRecrutement: '',
  dejaLaissezPasser: '',
  numLaissezPasser: '',
  objetAutorisation: '',
  zonesSurete: '',
  portesAcces: '',
  modeReglement: '',
  // Étape 3 (fichiers)
  photoAgrafe: null,
  attestationTravail: null,
  photocopieCIN: null,
  quitusONDA: null,
  copieStatutConvention: null,
  attestationStage: null,
};

export default function DemandeBadgeFormWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v) data.append(k, v);
      });
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        data.append('utilisateurId', user.id);
      }
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8081/api/demandes/badge', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      if (!res.ok) throw new Error('Erreur lors de la soumission du formulaire');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function generatePDF(formData) {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Récapitulatif de la demande de badge', 10, 20);
    let y = 35;
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'string' && value) {
        doc.text(`${key} : ${value}`, 10, y);
        y += 8;
      }
    });
    y += 10;
    doc.text('Signature employé ici : ____________________', 10, y);
    doc.save('demande_badge.pdf');
  }

  if (success) return (
    <div style={{color:'green',padding:24}}>
      Votre demande a bien été envoyée !<br /><br />
      <button onClick={() => generatePDF(formData)}>
        Télécharger mon formulaire
      </button>
    </div>
  );

  return (
    <div className="main-content" style={{ padding: '20px' }}>
      <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '0 auto', background: '#f9f9f9', padding: 24, borderRadius: 12 }}>
        {step === 1 && (
          <>
            <h3>Étape 1️⃣ : Informations personnelles</h3>
            <Input label="Nom" name="nom" value={formData.nom} onChange={handleChange} />
            <Input label="Prénom" name="prenom" value={formData.prenom} onChange={handleChange} />
            <Input label="Nationalité" name="nationalite" value={formData.nationalite} onChange={handleChange} />
            <Input label="Fils (le) de" name="filsDe" value={formData.filsDe} onChange={handleChange} />
            <Input label="Ben" name="ben" value={formData.ben} onChange={handleChange} />
            <Input label="Et de" name="etDe" value={formData.etDe} onChange={handleChange} />
            <Input label="Bent" name="bent" value={formData.bent} onChange={handleChange} />
            <Input label="Situation familiale" name="situationFamiliale" value={formData.situationFamiliale} onChange={handleChange} />
            <Input label="Nombre d'enfants" name="nombreEnfants" value={formData.nombreEnfants} onChange={handleChange} type="number" />
            <Input label="Date de naissance" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} type="date" />
            <Input label="Lieu de naissance" name="lieuNaissance" value={formData.lieuNaissance} onChange={handleChange} />
            <Input label="N° C.I.N" name="numCIN" value={formData.numCIN} onChange={handleChange} />
            <Input label="Date d'expiration" name="dateExpirationCIN" value={formData.dateExpirationCIN} onChange={handleChange} type="date" />
            <Input label="N° Passeport" name="numPasseport" value={formData.numPasseport} onChange={handleChange} />
            <Input label="Date de délivrance" name="dateDelivrancePasseport" value={formData.dateDelivrancePasseport} onChange={handleChange} type="date" />
            <Input label="Adresse personnelle" name="adresse" value={formData.adresse} onChange={handleChange} />
            <Input label="Ville" name="ville" value={formData.ville} onChange={handleChange} />
            <div style={{textAlign:'right',marginTop:24}}>
              <button type="button" onClick={handleNext} style={btnStyle}>Suivant</button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h3>Étape 2️⃣ : Informations professionnelles et accès</h3>
            <Input label="Organisme Employeur" name="organisme" value={formData.organisme} onChange={handleChange} />
            <Input label="Fonction" name="fonction" value={formData.fonction} onChange={handleChange} />
            <Input label="Date de recrutement" name="dateRecrutement" value={formData.dateRecrutement} onChange={handleChange} type="date" />
            <Select label="Avez-vous déjà eu un laissez-passer ?" name="dejaLaissezPasser" value={formData.dejaLaissezPasser} onChange={handleChange} options={["Permanent", "Temporaire", "Non"]} />
            {formData.dejaLaissezPasser !== 'Non' && (
              <Input label="Si oui, N°" name="numLaissezPasser" value={formData.numLaissezPasser} onChange={handleChange} />
            )}
            <Input label="Objet de l'autorisation d'accès" name="objetAutorisation" value={formData.objetAutorisation} onChange={handleChange} />
            <Input label="Zones de sûreté proposées" name="zonesSurete" value={formData.zonesSurete} onChange={handleChange} />
            <Input label="Portes d'accès proposées" name="portesAcces" value={formData.portesAcces} onChange={handleChange} />
            <Select label="Mode de règlement" name="modeReglement" value={formData.modeReglement} onChange={handleChange} options={["Comptant", "Facturé", "Exonéré"]} />
            <div style={{display:'flex',justifyContent:'space-between',marginTop:24}}>
              <button type="button" onClick={handlePrev} style={btnStyle}>Retour</button>
              <button type="button" onClick={handleNext} style={btnStyle}>Suivant</button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h3>Étape 3️⃣ : Téléversement de documents</h3>
            <FileInput label="Photo agrafée" name="photoAgrafe" onChange={handleChange} />
            <FileInput label="Attestation de travail ou photocopie C.L" name="attestationTravail" onChange={handleChange} />
            <FileInput label="Photocopie de la CIN" name="photocopieCIN" onChange={handleChange} />
            <FileInput label="Quitus ONDA" name="quitusONDA" onChange={handleChange} />
            <FileInput label="Copie (statut + Convention)" name="copieStatutConvention" onChange={handleChange} />
            <FileInput label="Attestation d'acceptation de stage" name="attestationStage" onChange={handleChange} />
            <div style={{display:'flex',justifyContent:'space-between',marginTop:24}}>
              <button type="button" onClick={handlePrev} style={btnStyle}>Retour</button>
              <button type="submit" style={btnStyle} disabled={loading}>{loading ? 'Envoi...' : 'Envoyer'}</button>
            </div>
            {error && <div style={{color:'red',marginTop:12}}>{error}</div>}
          </>
        )}
      </form>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{marginBottom:12}}>
      <label style={{display:'block',fontWeight:500,marginBottom:4}}>{label}</label>
      <input {...props} style={{width:'100%',padding:8,borderRadius:4,border:'1px solid #ccc'}} />
    </div>
  );
}
function Select({ label, name, value, onChange, options }) {
  return (
    <div style={{marginBottom:12}}>
      <label style={{display:'block',fontWeight:500,marginBottom:4}}>{label}</label>
      <select name={name} value={value} onChange={onChange} style={{width:'100%',padding:8,borderRadius:4,border:'1px solid #ccc'}}>
        <option value="">Choisir...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
function FileInput({ label, name, onChange }) {
  return (
    <div style={{marginBottom:12}}>
      <label style={{display:'block',fontWeight:500,marginBottom:4}}>{label}</label>
      <input type="file" name={name} onChange={onChange} />
    </div>
  );
}

const btnStyle = { background:'#b22', color:'white', border:'none', borderRadius:8, padding:'10px 28px', fontSize:16, cursor:'pointer' }; 