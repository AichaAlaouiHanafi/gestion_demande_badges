package com.G_des_badges.demande_des_badges.utilisateur.dto;

import com.G_des_badges.demande_des_badges.model.Role;
import lombok.Data;

@Data
public class UtilisateurResponseDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String position;
    private String email;
    private String nomDepartement;
    private Long departementId;
    private Role role;
}
