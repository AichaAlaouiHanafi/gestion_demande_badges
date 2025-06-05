import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

// Désactiver withCredentials
axios.defaults.withCredentials = false;

// Ajouter le token dans les requêtes
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token && token.startsWith('ey')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Gérer les erreurs globales
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);

    if (error.response && error.response.status === 401) {
      authService.logout();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  // 🔐 Connexion
  login: async (credentials) => {
    try {
      console.log(`Tentative de connexion à ${API_URL}/auth/login avec:`, credentials);

      const response = await axios.post(`${API_URL}/auth/login`, credentials, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false
      });

      console.log('Réponse login réussie:', response.data);

      const token = response.data.token;

      if (token && token.startsWith('ey')) {
        localStorage.removeItem('token'); // Nettoyer
        localStorage.setItem('token', token);
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('nom', response.data.nom);

        const userData = {
          id: response.data.id,
          nom: response.data.nom,
          prenom: response.data.prenom,
          email: response.data.email,
          role: response.data.role,
          departement: response.data.departement || null
        };

        localStorage.setItem('user', JSON.stringify(userData));

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        throw new Error("Token JWT invalide ou manquant");
      }

      return response;
    } catch (error) {
      console.error('Erreur de login:', error);

      // Si CORS ou problème de credentials → fallback fetch
      if (error.message && (error.message.includes('CORS') || error.message.includes('credentials'))) {
        console.log("Tentative alternative avec fetch API...");
        try {
          const fetchResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(credentials),
            mode: 'cors',
            credentials: 'omit'
          });

          if (!fetchResponse.ok) {
            throw new Error(`HTTP error! status: ${fetchResponse.status}`);
          }

          const data = await fetchResponse.json();
          console.log('Réponse fetch réussie:', data);

          const token = data.token;

          if (token && token.startsWith('ey')) {
            localStorage.removeItem('token');
            localStorage.setItem('token', token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('nom', data.nom);

            const userData = {
              id: data.id,
              nom: data.nom,
              prenom: data.prenom,
              email: data.email,
              role: data.role,
              departement: data.departement || null
            };

            localStorage.setItem('user', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            throw new Error("Token JWT invalide ou manquant dans fetch");
          }

          return { data };
        } catch (fetchError) {
          console.error('Erreur fetch:', fetchError);
          throw fetchError;
        }
      }

      throw error;
    }
  },

  // ✅ Méthodes inchangées :

  signup: async (userData) => {
    try {
      return await axios.post(`${API_URL}/auth/signup`, userData, { withCredentials: false });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  },

  deleteUtilisateur: async (userId) => {
    try {
      return await axios.delete(`/api/utilisateurs/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  },

  getDepartments: async () => {
    try {
      return await axios.get(`${API_URL}/departments`, { withCredentials: false });
    } catch (error) {
      console.error('Erreur lors de la récupération des départements:', error);
      throw error;
    }
  },

  getPendingRegistrations: async () => {
    try {
      return await axios.get(`${API_URL}/auth/pending-registrations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: false
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des inscriptions en attente:', error);
      throw error;
    }
  },

  approveEmployee: async (employeeId) => {
    try {
      return await axios.post(`${API_URL}/auth/approve/${employeeId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: false
      });
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      throw error;
    }
  },

  rejectEmployee: async (employeeId, reason) => {
    try {
      return await axios.post(`${API_URL}/auth/reject/${employeeId}`, { reason }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: false
      });
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      throw error;
    }
  },

  createPassword: async (token, password) => {
    try {
      return await axios.post(`${API_URL}/auth/create-password/${token}`,
        { newPassword: password },
        { withCredentials: false }
      );
    } catch (error) {
      console.error('Erreur lors de la création du mot de passe:', error);
      throw error;
    }
  },

  // ✅ Méthode modifiée pour ignorer les tokens invalides
  getUtilisateursVisibles: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !token.startsWith('ey')) {
        throw new Error('Token invalide ou manquant dans le localStorage.');
      }

      return await axios.get(`${API_URL}/utilisateurs/visible`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs visibles:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('nom');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  },

  isLoggedIn: () => !!localStorage.getItem('token'),

  getRole: () => localStorage.getItem('role'),

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      const role = localStorage.getItem('role');
      const nom = localStorage.getItem('nom');
      return role && nom ? { role, nom } : null;
    }
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  },

  updateProfile: async (userData) => {
    const token = localStorage.getItem('token');
    try {
      console.log('=== Détails de la requête ===');
      console.log('Token JWT:', token);
      console.log('Token décodé:', token ? JSON.parse(atob(token.split('.')[1])) : 'Pas de token');
      console.log('URL:', `${API_URL}/utilisateurs/${userData.id}`);
      console.log('Données envoyées:', userData);
      console.log('Headers:', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
      const response = await axios.put(`${API_URL}/utilisateurs/${userData.id}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.log('=== Détails de l\'erreur ===');
      console.log('Status:', error.response?.status);
      console.log('Message d\'erreur:', error.response?.data?.message || error.message);
      console.log('Données d\'erreur:', error.response?.data);
      console.log('Headers de réponse:', error.response?.headers);
      console.log('Configuration de la requête:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          ...error.config?.headers,
          Authorization: error.config?.headers?.Authorization ? 'Bearer [MASKED]' : undefined
        }
      });
      
      // Vérifier si le token est expiré
      if (token) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const expirationDate = new Date(tokenData.exp * 1000);
          console.log('Token expiration:', expirationDate);
          console.log('Token est expiré:', expirationDate < new Date());
        } catch (e) {
          console.log('Erreur lors du décodage du token:', e);
        }
      }
      
      throw error;
    }
  },

  createUtilisateur: async (userData) => {
    const token = localStorage.getItem('token');
    try {
      return await axios.post('/api/utilisateurs', userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }
};

export default authService;
