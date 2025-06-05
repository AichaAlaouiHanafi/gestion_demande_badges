import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';

const UtilisateurPage = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const user = authService.getCurrentUser();
  const departementId = user?.departement?.id;


  useEffect(() => {
    

    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      console.log("Rôle insuffisant pour accéder à cette page");
      navigate('/');
      return;
    }
  }, [token, role, navigate]);

  const fetchUtilisateurs = async () => {
    if (!token) return;

    setLoading(true);
    setErreur(null);

    try {
      console.log("📥 Récupération des utilisateurs visibles (via authService)");
      const response = await authService.getUtilisateursVisibles();
      console.log("✅ Utilisateurs récupérés :", response.data);
      setUtilisateurs(response.data);
    } catch (err) {
      console.error("❌ Erreur lors de la récupération des utilisateurs :", err);
      let messageErreur = "Erreur lors du chargement des utilisateurs";
      if (err.response) {
        if (err.response.status === 403) {
          messageErreur = "Vous n'avez pas les droits nécessaires pour voir cette liste";
        } else if (err.response.data?.message) {
          messageErreur = err.response.data.message;
        }
      }
      setErreur(messageErreur);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUtilisateurs();
      console.log("Déclenchement fetchUtilisateurs avec : ", {
  token,
  role,
  departementId,
  user
});

    }
  }, [token, role, departementId]);

  const handleEdit = (user) => {
    navigate(`/superadmin/utilisateurs/edit/${user.id}`);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      try {
        await authService.deleteUtilisateur(userId);
        setUtilisateurs(utilisateurs.filter(user => user.id !== userId));
        alert("Utilisateur supprimé avec succès.");
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        let messageErreur = "Échec de la suppression.";
        if (error.response?.data?.message) {
          messageErreur = error.response.data.message;
        }
        alert(messageErreur);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Chargement des utilisateurs...</p>
      </div>
    );
  }

  if (erreur) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h3>Erreur</h3>
        <p>{erreur}</p>
        <button
          onClick={fetchUtilisateurs}
          style={{
            padding: '10px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Liste des utilisateurs visibles</h2>

      {(role === "SUPERADMIN" || role === "ADMIN") && (
        <button
          onClick={() => navigate('/superadmin/utilisateurs/ajouter')}
          style={{
            marginBottom: '1rem',
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Ajouter utilisateur
        </button>
      )}

      {utilisateurs.length === 0 ? (
        <p>Aucun utilisateur trouvé.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Département</th>
              <th>Position</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nom}</td>
                <td>{user.prenom}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.nomDepartement || 'Non défini'}</td>
                <td>{user.position || 'Non défini'}</td>
                <td>
                  {(role === "SUPERADMIN" || role === "ADMIN") && (
                    <>
                      <button
                        onClick={() => navigate(`/superadmin/utilisateurs/edit/${user.id}`)}
                        style={{
                          marginRight: '5px',
                          padding: '5px 10px',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        Modifier
                      </button>
                      {(role === "SUPERADMIN" || role === "ADMIN") && (
                        <button
                          onClick={() => {
                            if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
                              handleDelete(user.id);
                            }
                          }}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          Supprimer
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <button
            onClick={() => {
              console.log("Debug info:", {
                token: token ? "présent" : "absent",
                role,
                utilisateurs: utilisateurs.length,
                user,
                departementId
              });
            }}
            style={{ padding: '5px 10px' }}
          >
            Debug Info
          </button>
        </div>
      )}
    </div>
  );
};

export default UtilisateurPage;
