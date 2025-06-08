package com.G_des_badges.demande_des_badges.badge.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.G_des_badges.demande_des_badges.utilisateur.entity.Utilisateur;

@Entity
@Table(name = "badges")
@Data
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;

    private boolean actif;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;
}