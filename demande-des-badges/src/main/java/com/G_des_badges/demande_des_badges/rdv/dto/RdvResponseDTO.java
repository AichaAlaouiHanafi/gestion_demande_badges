package com.G_des_badges.demande_des_badges.rdv.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RdvResponseDTO {
    private Long id;
    private Long demandeId;
    private LocalDateTime dateProposee;
    private boolean modifie;
    private boolean confirme;
    private String nomEmploye;
    private String prenomEmploye;
    private String emailEmploye;
    private Integer delaiRappel;
}