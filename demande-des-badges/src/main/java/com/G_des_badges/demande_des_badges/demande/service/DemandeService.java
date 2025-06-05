package com.G_des_badges.demande_des_badges.demande.service;

import com.G_des_badges.demande_des_badges.demande.dto.DemandeRequestDTO;
import com.G_des_badges.demande_des_badges.demande.dto.DemandeResponseDTO;
import com.G_des_badges.demande_des_badges.model.StatutDemande;

import java.util.List;

public interface DemandeService {
    DemandeResponseDTO demanderBadge(DemandeRequestDTO dto);
    DemandeResponseDTO validerParAdmin(Long demandeId);
    DemandeResponseDTO validerParSuperAdmin(Long demandeId);
    DemandeResponseDTO validerFormulaireParAdmin(Long demandeId);
    List<DemandeResponseDTO> getAll();
    List<DemandeResponseDTO> getByUtilisateur(Long utilisateurId);
    DemandeResponseDTO refuserDemande(Long id);
    // Méthodes pour la gestion des statuts
    void setStatutRdvPropose(Long demandeId);
    void setStatutRdvModifie(Long demandeId);
    void setStatutRdvConfirme(Long demandeId);
    void setStatutNotifConfirmation(Long demandeId);
    void setStatutRappelRdv(Long demandeId);
    void setStatutRecuperationConfirme(Long demandeId);
    void setStatutDepotDemande(Long demandeId);
    void setStatutRecuperationDemande(Long demandeId);
    void configurerRappelDemande(Long demandeId, Integer delaiRappel);
}