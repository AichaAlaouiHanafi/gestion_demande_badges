import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../api/authService';

const roles = [
  { value: 'EMPLOYEE', label: 'Employé' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPERADMIN', label: 'SuperAdmin' }
];

const ModifierUtilisateur = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    position: '',
    role: 'EMPLOYEE',
    nomDepartement: ''
  });
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Charger la liste des départements
    const fetchDepartments = async () => {
      try {
        const res = await authService.getDepartments();
        setDepartements(res.data);
      } catch (err) {
        setDepartements([]);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    // Charger les infos de l'utilisateur à modifier
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await authService.getUtilisateursVisibles();
        const user = res.data.find(u => String(u.id) === String(id));
        if (!user) {
          setError("Utilisateur introuvable");
        } else {
          setForm({
            nom: user.nom || '',
            prenom: user.prenom || '',
            email: user.email || '',
            position: user.position || '',
            role: user.role || 'EMPLOYEE',
            nomDepartement: user.nomDepartement || ''
          });
        }
      } catch (err) {
        setError("Erreur lors du chargement de l'utilisateur.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authService.updateProfile({ ...form, id });
      setSuccess('Utilisateur modifié avec succès !');
      setTimeout(() => navigate('/superadmin/utilisateurs'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Chargement...</div>;
  }

  return (
    <div style={{ maxWidth: 500, margin: 'auto', background: '#fff', padding: 24, borderRadius: 8, marginTop: 40 }}>
      <h2>Modifier un utilisateur</h2>
      <form onSubmit={handleSubmit}>
        <label>Nom :<br />
          <input name="nom" value={form.nom} onChange={handleChange} required style={{ width: '100%' }} />
        </label><br /><br />
        <label>Prénom :<br />
          <input name="prenom" value={form.prenom} onChange={handleChange} required style={{ width: '100%' }} />
        </label><br /><br />
        <label>Email :<br />
          <input name="email" value={form.email} onChange={handleChange} required type="email" style={{ width: '100%' }} disabled />
        </label><br /><br />
        <label>Position :<br />
          <input name="position" value={form.position} onChange={handleChange} style={{ width: '100%' }} />
        </label><br /><br />
        <label>Rôle :<br />
          <select name="role" value={form.role} onChange={handleChange} style={{ width: '100%' }}>
            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label><br /><br />
        <label>Département :<br />
          <select name="nomDepartement" value={form.nomDepartement} onChange={handleChange} required style={{ width: '100%' }}>
            <option value="">-- Choisir --</option>
            {departements.map(dep => (
              <option key={dep.id} value={dep.nomDepartement}>{dep.nomDepartement}</option>
            ))}
          </select>
        </label><br /><br />
        <button type="submit" disabled={loading} style={{ background: '#2196F3', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4 }}>
          {loading ? 'Modification...' : 'Enregistrer'}
        </button>
        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
        {success && <p style={{ color: 'green', marginTop: 10 }}>{success}</p>}
      </form>
      <button onClick={() => navigate(-1)} style={{ marginTop: 20 }}>Retour</button>
    </div>
  );
};

export default ModifierUtilisateur; 