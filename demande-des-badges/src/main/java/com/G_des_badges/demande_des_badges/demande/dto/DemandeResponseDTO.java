package com.G_des_badges.demande_des_badges.demande.dto;

import lombok.Data;
import com.G_des_badges.demande_des_badges.model.StatutDemande;
import com.G_des_badges.demande_des_badges.model.TypeDemande;

@Data
public class DemandeResponseDTO {
    private Long id;
    private Long utilisateurId;
    private StatutDemande statut;
    private String formulaire;
    private TypeDemande type;
    private Integer delaiRappel;
    private String nomUtilisateur;
    private String prenomUtilisateur;
    private String emailUtilisateur;
    private String numeroTelephoneUtilisateur;
    private String adresseUtilisateur;
    private String villeUtilisateur;
    private String codePostalUtilisateur;
    
}