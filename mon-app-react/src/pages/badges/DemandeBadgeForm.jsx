import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

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
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  //if (!formulaire) return <p style={{ color: 'orange' }}>Le formulaire n'est pas encore accessible. Attendez la validation de l'admin.</p>;
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
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('PERMIS D\'ACCES TEMPORAIRE - Zone Réglementée', 10, 10);
    doc.text(`Nom : ${form.nom}`, 10, 20);
    doc.text(`Prénom : ${form.prenom}`, 10, 30);
    doc.text(`Nationalité : ${form.nationalite}`, 10, 40);
    doc.text(`Fils (le) de : ${form.filiation}`, 10, 50);
    doc.text(`Situation familiale : ${form.situationFamiliale}`, 10, 60);
    doc.text(`Nombre d'enfants : ${form.nbEnfants}`, 10, 70);
    doc.text(`Date et lieu de naissance : ${form.dateNaissance}`, 10, 80);
    doc.text(`N° C.L.N : ${form.cln}`, 10, 90);
    doc.text(`Date d'expiration : ${form.dateExpiration}`, 10, 100);
    doc.text(`N° Passeport : ${form.passport}`, 10, 110);
    doc.text(`Date de délivrance : ${form.dateDelivrance}`, 10, 120);
    doc.text(`Adresse personnelle : ${form.adresse}`, 10, 130);
    doc.text(`Ville : ${form.ville}`, 10, 140);
    doc.text(`Organisme employeur : ${form.organisme}`, 10, 150);
    doc.text(`Fonction : ${form.fonction}`, 10, 160);
    doc.text(`Date de recrutement : ${form.dateRecrutement}`, 10, 170);
    doc.text(`Déjà eu un laissez-passer : ${form.dejaLaissezPasser}`, 10, 180);
    doc.text(`Type Laissez-Passer : ${form.typeLaissezPasser}`, 10, 190);
    doc.text(`N° Laissez-Passer : ${form.numLaissezPasser}`, 10, 200);
    doc.text(`Objet de l'autorisation d'accès : ${form.objet}`, 10, 210);
    doc.text(`Zones de sûreté proposées : ${form.zonesSurete}`, 10, 220);
    doc.text(`Portes d'accès proposées : ${form.portesAcces}`, 10, 230);
    doc.text(`Mode de règlement : ${form.modeReglement}`, 10, 240);
    doc.text(`Date employeur : ${form.dateEmployeur}`, 10, 250);
    doc.text(`Date sûreté nationale : ${form.dateSurete}`, 10, 260);
    doc.text(`Date gendarmerie : ${form.dateGendarmerie}`, 10, 270);
    doc.text(`Date directeur : ${form.dateDirecteur}`, 10, 280);
    doc.text(`N° dossier : ${form.numDossier}`, 10, 290);
    doc.text(`Secteurs : ${form.secteurs}`, 10, 300);
    doc.text(`Portes : ${form.portes}`, 10, 310);
    doc.text(`Fait le : ${form.dateFait}`, 10, 320);
    doc.text(`À : ${form.lieu}`, 10, 330);
    doc.text(`Signature du concerné : ${form.signatureConcerne}`, 10, 340);
    doc.save('formulaire_badge.pdf');
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