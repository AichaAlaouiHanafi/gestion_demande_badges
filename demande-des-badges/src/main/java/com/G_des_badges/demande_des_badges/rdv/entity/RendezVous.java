package com.G_des_badges.demande_des_badges.rdv.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "rendez_vous")
@Data
public class RendezVous {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long demandeId;
    private LocalDateTime dateProposee;
    private boolean modifie;
    private boolean confirme;
    private LocalDateTime dateModification;
    private String nomEmploye;
    private String prenomEmploye;
    private String emailEmploye;

    // Délai de rappel choisi par l'employé (en heures)
    private Integer delaiRappel;
}
