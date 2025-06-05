import React, { useState } from 'react';

const RecuperationBadgeForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    nomComplet: '',
    numeroEmploye: '',
    numeroBadge: '',
    dateDepotInitial: '',
    dateSouhaitee: '',
    creneau: '',
    motif: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log("Soumission du formulaire !");
    setLoading(true);
    setMessage('');
    try {
      await onSubmit(form);
      setMessage('Demande envoyée avec succès !');
    } catch (err) {
      setMessage('Erreur lors de l\'envoi de la demande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 20, borderRadius: 8, maxWidth: 500, margin: 'auto' }}>
      <h3>Récupération d'un badge déposé</h3>
      <label>Nom complet :<br />
        <input name="nomComplet" value={form.nomComplet} onChange={handleChange} required />
      </label><br /><br />
      <label>Numéro d'employé :<br />
        <input name="numeroEmploye" value={form.numeroEmploye} onChange={handleChange} required />
      </label><br /><br />
      <label>Numéro du badge :<br />
        <input name="numeroBadge" value={form.numeroBadge} onChange={handleChange} required placeholder="Ex: BG-2023-0452" />
      </label><br /><br />
      <label>Date de dépôt initial :<br />
        <input type="date" name="dateDepotInitial" value={form.dateDepotInitial} onChange={handleChange} required />
      </label><br /><br />
      <label>Date souhaitée :<br />
        <input type="date" name="dateSouhaitee" value={form.dateSouhaitee} onChange={handleChange} required />
      </label><br /><br />
      <label>Créneau horaire :<br />
        <label><input type="radio" name="creneau" value="9h-12h" checked={form.creneau === '9h-12h'} onChange={handleChange} required /> 9h-12h</label>
        <label style={{ marginLeft: 20 }}><input type="radio" name="creneau" value="14h-17h" checked={form.creneau === '14h-17h'} onChange={handleChange} required /> 14h-17h</label>
      </label><br /><br />
      <label>Motif (optionnel) :<br />
        <textarea name="motif" value={form.motif} onChange={handleChange} />
      </label><br /><br />
      <button type="submit" disabled={loading} style={{ background: '#800000', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4 }}>
        {loading ? 'Envoi...' : 'Soumettre'}
      </button>
      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </form>
  );
};

export default RecuperationBadgeForm; 