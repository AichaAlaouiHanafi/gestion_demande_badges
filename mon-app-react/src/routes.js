import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth pages
import LoginPage from './pages/auth/LoginPage.jsx';
import SignUpPage from './pages/auth/SignUpPage.jsx';
import SignUpSuccess from './pages/auth/SignUpSuccess.jsx';
import CreatePasswordPage from './pages/auth/createPasswordPage.jsx';
import SignUpPending from './pages/auth/SignUpPending.jsx';
import ProposerRdvPage from './pages/RDV/ProposerRdvPage.jsx';
import MesRendezVous from './pages/RDV/MesRendezVous.jsx';
import SuperAdminRdvsPage from './pages/RDV/SuperAdminRdvsPage.jsx';
// Layout
import AppLayout from './pages/layout/AppLayout.jsx';
import ListeDemandes from './pages/badges/ListeDemandes.jsx';
// Admin
import ProfileAdmin from './pages/profiles/admin/ProfileAdmin.jsx';
import InscriptionPage from './pages/inscription/inscriptions.jsx';

// Employee
import ProfileEmployee from './pages/profiles/employee/ProfileEmployee.jsx';

// SuperAdmin
import ProfileSuperAdmin from './pages/profiles/superAdmin/ProfileSuperAdmin.jsx';
import AjouterUtilisateur from './pages/utilisateur/AjouterUtilisateur.jsx';
// Badges
import DemandeBadgeForm from './pages/badges/DemandeBadgeForm.jsx';
import ListeBadgesEmploye from './pages/badges/ListeBadgesEmploye.jsx';
import ValidationFormAdmin from './pages/badges/ValidationFormAdmin.jsx';
import DemandeBadgePage from './pages/badges/DemandeBadgePage.jsx';

// Notifications
import NotificationPage from './pages/notifications/NotificationPage.jsx';

// ProtectedRoute
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import ModifierUtilisateur from './pages/utilisateur/ModifierUtilisateur.jsx';


// Pages personnalisées
import UtilisateurPage from './pages/utilisateur/UtilisateurPage.jsx';
import DepartementEmployesPage from './pages/Departement/DepartementEmployesPage.jsx';

const AppRoutes = () => {
  return (
    <Routes>

      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signup-success" element={<SignUpSuccess />} />
      <Route path="/signup-pending" element={<SignUpPending />} />
      <Route path="/create-password/:token" element={<CreatePasswordPage />} />

      {/* EMPLOYEE */}
      <Route path="/employee" element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
        <Route element={<AppLayout />}>
          <Route index element={<ProfileEmployee />} />
          <Route path="profile" element={<ProfileEmployee />} />
          <Route path="badges" element={<ListeBadgesEmploye />} />
          <Route path="demandes" element={<DemandeBadgePage />} />
          <Route path="demandes" element={<ListeDemandes />} />
          <Route path="rdvs" element={<MesRendezVous />} />
          <Route path="notifications" element={<NotificationPage />} />
        </Route>
      </Route>

      {/* ADMIN */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AppLayout />}>
          <Route index element={<ProfileAdmin />} />
          <Route path="profile" element={<ProfileAdmin />} />
          <Route path="badges" element={<ValidationFormAdmin />} />
          <Route path="demandes" element={<ValidationFormAdmin />} />
          <Route path="rdvs" element={<div>Admin RDVs Page</div>} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="demandes" element={<ListeDemandes />} />
          <Route path="utilisateurs" element={<UtilisateurPage />} />
          <Route path="inscription" element={<InscriptionPage />} />
          <Route path="/admin/utilisateurs/edit/:id" element={<ModifierUtilisateur />} />
          <Route path="/admin/utilisateurs/ajouter" element={<AjouterUtilisateur />} />
        </Route>
      </Route>
      <Route path="/superadmin" element={<ProtectedRoute allowedRoles={['SUPERADMIN']} />}>
  <Route element={<AppLayout />}>
    <Route index element={<ProfileSuperAdmin />} />
    <Route path="profile" element={<ProfileSuperAdmin />} />
    <Route path="badges" element={<ValidationFormAdmin />} />
    <Route path="/superadmin/utilisateurs/edit/:id" element={<ModifierUtilisateur />} />
    <Route path="/superadmin/utilisateurs/ajouter" element={<AjouterUtilisateur />} />
    <Route path="demandes" element={<ListeDemandes />} />
    <Route path="rdvs" element={<SuperAdminRdvsPage />} />
    <Route path="rdv/proposer/:demandeId" element={<ProposerRdvPage />} />
    <Route path="notifications" element={<NotificationPage />} />
    <Route path="utilisateurs" element={<UtilisateurPage />} />
   
    <Route path="departements" element={<DepartementEmployesPage/>} />
  </Route>
</Route>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
