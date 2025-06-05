// Modifiez votre fichier ProtectedRoute.jsx pour qu'il ne vérifie pas l'authentification
// mais définisse automatiquement le rôle en fonction de l'URL

import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Non connecté : redirige vers login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Rôle non autorisé : redirige vers login
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // Sinon, accès autorisé
  return <Outlet />;
};

export default ProtectedRoute;