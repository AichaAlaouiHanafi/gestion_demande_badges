import React, { useState } from 'react';

const DepotBadgeForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    numeroBadge: '',
    motif: '',
    dateSouhaitee: '',
    heureSouhaitee: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
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
      <h3>Demande de dépôt de badge</h3>
      <label>Numéro du badge :<br />
        <input name="numeroBadge" value={form.numeroBadge} onChange={handleChange} required placeholder="Ex: 123456" />
      </label><br /><br />
      <label>Motif du dépôt :<br />
        <textarea name="motif" value={form.motif} onChange={handleChange} required placeholder="Indiquez la raison du dépôt..." />
      </label><br /><br />
      <label>Date souhaitée :<br />
        <input type="date" name="dateSouhaitee" value={form.dateSouhaitee} onChange={handleChange} required />
      </label><br /><br />
      <label>Heure souhaitée :<br />
        <input type="time" name="heureSouhaitee" value={form.heureSouhaitee} onChange={handleChange} required />
      </label><br /><br />
      <button type="submit" disabled={loading} style={{ background: '#800000', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4 }}>
        {loading ? 'Envoi...' : 'Envoyer la demande'}
      </button>
      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </form>
  );
};

export default DepotBadgeForm; 