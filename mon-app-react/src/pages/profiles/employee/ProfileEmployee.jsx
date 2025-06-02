import React, { useState } from 'react';
import { authService } from '../../../api/authService';

const ProfilePage = () => {
  const user = authService.getCurrentUser();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ ...user });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await authService.updateProfile(form);
      // Mettre à jour le localStorage pour refléter les changements
      localStorage.setItem('user', JSON.stringify({ ...user, ...form }));
      alert('Profil mis à jour avec succès !');
      setEditMode(false);
    } catch (error) {
      alert('Erreur lors de la mise à jour du profil.');
    }
  };

  if (!user) return <p>Utilisateur non connecté.</p>;

  return (
    <div style={{ maxWidth: 500, margin: 'auto', background: '#fff', padding: 20, borderRadius: 8 }}>
      <h2>Mon profil</h2>
      {!editMode ? (
        <>
          <p><b>Nom :</b> {user.nom}</p>
          <p><b>Prénom :</b> {user.prenom}</p>
          <p><b>Email :</b> {user.email}</p>
          <p><b>Rôle :</b> {user.role}</p>
          <p><b>Département :</b> {user.departement?.nomDepartement || 'Non défini'}</p>
          <button onClick={() => setEditMode(true)}>Modifier</button>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>Nom : <input name="nom" value={form.nom} onChange={handleChange} /></label><br />
          <label>Prénom : <input name="prenom" value={form.prenom} onChange={handleChange} /></label><br />
          <label>Email : <input name="email" value={form.email} onChange={handleChange} disabled /></label><br />
          {/* Ajoute d'autres champs si besoin */}
          <button type="submit">Enregistrer</button>
          <button type="button" onClick={() => setEditMode(false)} style={{ marginLeft: 10 }}>Annuler</button>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;