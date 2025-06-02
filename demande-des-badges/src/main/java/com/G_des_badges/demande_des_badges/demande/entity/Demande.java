package com.G_des_badges.demande_des_badges.demande.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import com.G_des_badges.demande_des_badges.model.StatutDemande;
import com.G_des_badges.demande_des_badges.model.TypeDemande;

@Entity
@Table(name = "demandes")
@Data
public class Demande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long utilisateurId;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutDemande statut;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private TypeDemande type;

    @Column(columnDefinition = "TEXT")
    private String formulaire; // contenu ou URL

    private LocalDateTime dateDemande;
    private LocalDateTime dateValidationAdmin;
    private LocalDateTime dateValidationSuperAdmin;
}
