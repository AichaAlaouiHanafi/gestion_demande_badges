package com.G_des_badges.demande_des_badges.demande.dto;

import lombok.Data;
import com.G_des_badges.demande_des_badges.model.StatutDemande;
import com.G_des_badges.demande_des_badges.model.TypeDemande;

@Data
public class DemandeRequestDTO {
    private Long utilisateurId;
    private String formulaire;
    private TypeDemande type;
    // private StatutDemande statut;
}