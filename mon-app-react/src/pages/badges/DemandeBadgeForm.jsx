import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import logoONDA from '../../assets/ONDA.png';
import logoRAM from '../../assets/RAM.png';

const DemandeBadgeForm = ({ demandeId, onSubmit, typeDemande }) => {
  console.log("[DemandeBadgeForm] Monté avec demandeId:", demandeId, "typeDemande:", typeDemande);
  const [formulaire, setFormulaire] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nom: '', prenom: '', nationalite: '', filiation: '', situationFamiliale: '', nbEnfants: '', dateNaissance: '', cln: '', dateExpiration: '', passport: '', dateDelivrance: '', adresse: '', ville: '', organisme: '', fonction: '', dateRecrutement: '', dejaLaissezPasser: '', typeLaissezPasser: '', numLaissezPasser: '', objet: '', zonesSurete: '', portesAcces: '', modeReglement: '', dateEmployeur: '', dateSurete: '', dateGendarmerie: '', dateDirecteur: '', numDossier: '', secteurs: '', portes: '', lieu: '', dateFait: '', signatureConcerne: '',
  });
  const [pdfFiles, setPdfFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [formulaireOk, setFormulaireOk] = useState(false);

  useEffect(() => {
    if (typeDemande === 'BADGE' && demandeId) {
      const fetchFormulaire = async () => {
        setLoading(true);
        setError(null);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:8081/api/demandes/${demandeId}/formulaire`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("[DemandeBadgeForm] Réponse fetchFormulaire:", res);
          if (res.data) {
            setFormulaire(res.data);
            setForm(typeof res.data === 'string' ? JSON.parse(res.data) : res.data);
          }
          setError(null);
        } catch (err) {
          console.error("Erreur fetchFormulaire:", err);
          if (err.response && err.response.status === 403) {
            setError("Le formulaire n'est pas encore accessible. Attendez la validation de l'admin.");
          } else {
            setError("Erreur lors du chargement du formulaire.");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchFormulaire();
    } else {
      console.log("[DemandeBadgeForm] Pas de fetch: typeDemande:", typeDemande, "demandeId:", demandeId);
    }
  }, [demandeId, typeDemande]);

  console.log("[DemandeBadgeForm] Render: loading=", loading, "error=", error, "formulaire=", formulaire);

  if (loading) return <p>Chargement du formulaire...</p>;
  if (!demandeId) return <p>Erreur: ID de demande manquant</p>;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = e => {
    setPdfFiles([...e.target.files]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8081/api/demandes/${demandeId}/formulaire`,
        { formulaire: JSON.stringify(form) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Formulaire OK. Vous pouvez télécharger votre formulaire au format PDF.');
      setFormulaireOk(true);
      if (onSubmit) onSubmit();
    } catch (err) {
      setMessage("Erreur lors de l'envoi du formulaire.");
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    // Logos
    const imgWidth = 40;
    const imgHeight = 24;
    doc.addImage(logoONDA, 'PNG', 15, 10, imgWidth, imgHeight);
    doc.addImage(logoRAM, 'PNG', 155, 10, imgWidth, imgHeight);
    // Titre principal
    doc.setFontSize(18);
    doc.setTextColor(128,0,0);
    doc.text('PERMIS D\'ACCES TEMPORAIRE', 105, 30, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(80, 0, 0);
    doc.text('Zone Réglementée', 105, 40, { align: 'center' });
    // Section A
    let y = 50;
    doc.setFillColor(36, 61, 97);
    doc.rect(15, y, 180, 10, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(13);
    doc.text('A   LES INFORMATIONS PERSONNELLES', 20, y + 7);
    y += 14;
    // Tableau infos personnelles
    doc.setTextColor(0,0,0);
    doc.setFontSize(11);
    const infosPerso = [
      ['Nom', form.nom, 'Prénom', form.prenom],
      ['fil de', form.filiation, 'Ben', form.ben],
      ['et de', form.etDe || '', 'Bent', form.bent || ''],
      ['lieu de naissance', form.lieuNaissance || '', 'Date de naissance', form.dateNaissance || ''],
      ['Nationalité', form.nationalite || '', 'Ville', form.ville || ''],
      ['situation familiale', form.situationFamiliale || '', "Nombre d'enfant", form.nbEnfants || ''],
      ['N C.I.N', form.cln || '', 'Date d\'expiration', form.dateExpiration || ''],
      ['N Passport', form.passport || '', 'Date de délivrance', form.dateDelivrance || ''],
      ['Adresse personnelle', form.adresse || '', '', '']
    ];
    // Largeur des colonnes
    const colW = [38, 38, 38, 38];
    // En-tête tableau
    infosPerso.forEach(row => {
      let x = 15;
      row.forEach((cell, idx) => {
        doc.rect(x, y, colW[idx], 10);
        if (cell) doc.text(String(cell), x + 2, y + 7);
        x += colW[idx];
      });
      y += 10;
    });
    y += 6;
    // Section B
    doc.setFillColor(36, 61, 97);
    doc.rect(15, y, 180, 10, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(13);
    doc.text('B   INFORMATIONS PROFESSIONNELLES ET ACCÈS ORGANISME EMPLOYEUR', 20, y + 7);
    y += 14;
    doc.setTextColor(0,0,0);
    doc.setFontSize(11);
    const infosPro = [
      ['Organisme employeur', form.organisme, 'Fonction', form.fonction],
      ['Date de recrutement', form.dateRecrutement, 'Avez-vous déjà un laissez-passer', form.dejaLaissezPasser],
      ['Type', form.typeLaissezPasser, 'Numéro', form.numLaissezPasser],
      ["Objet de l'autorisation d'accès", form.objet, '', ''],
      ['Zones de sûreté proposées', form.zonesSurete, '', ''],
      ['Mode de règlement', form.modeReglement, '', '']
    ];
    infosPro.forEach(row => {
      let x = 15;
      row.forEach((cell, idx) => {
        doc.rect(x, y, colW[idx], 10);
        if (cell) doc.text(String(cell), x + 2, y + 7);
        x += colW[idx];
      });
      y += 10;
    });
    // Signature
    y += 18;
    doc.setFontSize(12);
    doc.text('Signature', 160, y);
    doc.save('formulaire_badge_officiel.pdf');
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 20, borderRadius: 8, maxWidth: 900 }}>
      <h3>Formulaire de Sûreté</h3>
      <label>Nom : <input name="nom" value={form.nom} onChange={handleChange} required /></label><br />
      <label>Prénom : <input name="prenom" value={form.prenom} onChange={handleChange} required /></label><br />
      <label>Nationalité : <input name="nationalite" value={form.nationalite} onChange={handleChange} /></label><br />
      <label>Fils (le) de : <input name="filiation" value={form.filiation} onChange={handleChange} /></label><br />
      <label>Situation familiale : <input name="situationFamiliale" value={form.situationFamiliale} onChange={handleChange} /></label><br />
      <label>Nombre d'enfants : <input name="nbEnfants" value={form.nbEnfants} onChange={handleChange} /></label><br />
      <label>Date et lieu de naissance : <input name="dateNaissance" value={form.dateNaissance} onChange={handleChange} type="date" /></label><br />
      <label>N° C.L.N : <input name="cln" value={form.cln} onChange={handleChange} /></label><br />
      <label>Date d'expiration : <input name="dateExpiration" value={form.dateExpiration} onChange={handleChange} type="date" /></label><br />
      <label>N° Passeport : <input name="passport" value={form.passport} onChange={handleChange} /></label><br />
      <label>Date de délivrance : <input name="dateDelivrance" value={form.dateDelivrance} onChange={handleChange} type="date" /></label><br />
      <label>Adresse personnelle : <input name="adresse" value={form.adresse} onChange={handleChange} /></label><br />
      <label>Ville : <input name="ville" value={form.ville} onChange={handleChange} /></label><br />
      <label>Organisme employeur : <input name="organisme" value={form.organisme} onChange={handleChange} /></label><br />
      <label>Fonction : <input name="fonction" value={form.fonction} onChange={handleChange} /></label><br />
      <label>Date de recrutement : <input name="dateRecrutement" value={form.dateRecrutement} onChange={handleChange} type="date" /></label><br />
      <label>Avez-vous déjà eu un laissez-passer ?
        <select name="dejaLaissezPasser" value={form.dejaLaissezPasser} onChange={handleChange}>
          <option value="">--</option>
          <option value="oui">Oui</option>
          <option value="non">Non</option>
        </select>
      </label><br />
      <label>Type (Permanent/Temporaire) : <input name="typeLaissezPasser" value={form.typeLaissezPasser} onChange={handleChange} /></label><br />
      <label>N° : <input name="numLaissezPasser" value={form.numLaissezPasser} onChange={handleChange} /></label><br />
      <label>Objet de l'autorisation d'accès : <input name="objet" value={form.objet} onChange={handleChange} /></label><br />
      <label>Zones de sûreté proposées : <input name="zonesSurete" value={form.zonesSurete} onChange={handleChange} /></label><br />
      <label>Portes d'accès proposées : <input name="portesAcces" value={form.portesAcces} onChange={handleChange} /></label><br />
      <label>Mode de règlement :
        <select name="modeReglement" value={form.modeReglement} onChange={handleChange}>
          <option value="">--</option>
          <option value="comptant">Comptant</option>
          <option value="facture">Facturé</option>
          <option value="exonere">Exonéré</option>
        </select>
      </label><br />
      <label>Date employeur : <input name="dateEmployeur" value={form.dateEmployeur} onChange={handleChange} type="date" /></label><br />
      <label>Date sûreté nationale : <input name="dateSurete" value={form.dateSurete} onChange={handleChange} type="date" /></label><br />
      <label>Date gendarmerie : <input name="dateGendarmerie" value={form.dateGendarmerie} onChange={handleChange} type="date" /></label><br />
      <label>Date directeur : <input name="dateDirecteur" value={form.dateDirecteur} onChange={handleChange} type="date" /></label><br />
      <label>N° dossier : <input name="numDossier" value={form.numDossier} onChange={handleChange} /></label><br />
      <label>Secteurs : <input name="secteurs" value={form.secteurs} onChange={handleChange} /></label><br />
      <label>Portes : <input name="portes" value={form.portes} onChange={handleChange} /></label><br />
      <label>Fait le : <input name="dateFait" value={form.dateFait} onChange={handleChange} type="date" /></label><br />
      <label>À : <input name="lieu" value={form.lieu} onChange={handleChange} /></label><br />
      <label>Signature du concerné : <input name="signatureConcerne" value={form.signatureConcerne} onChange={handleChange} /></label><br />
      <label>Uploader un ou plusieurs fichiers PDF :
        <input type="file" accept="application/pdf" multiple onChange={handleFileChange} />
      </label><br />
      <button type="submit" style={{ marginTop: 20 }}>Envoyer</button>
      {message && <p>{message}</p>}
      {formulaireOk && (
        <button type="button" onClick={handleDownloadPDF} style={{marginTop: 10}}>
          Télécharger le formulaire PDF
        </button>
      )}
    </form>
  );
};

export default DemandeBadgeForm;