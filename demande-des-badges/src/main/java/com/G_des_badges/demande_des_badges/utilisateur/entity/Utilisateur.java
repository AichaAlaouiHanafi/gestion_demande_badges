package com.G_des_badges.demande_des_badges.utilisateur.entity;

import com.G_des_badges.demande_des_badges.departement.entity.Departement;
import com.G_des_badges.demande_des_badges.model.Role;
import com.G_des_badges.demande_des_badges.demande.entity.Demande;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
//import com.G_des_badges.demande_des_badges.demande.entity.Demande;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "utilisateurs")
@EntityListeners(AuditingEntityListener.class)
@Data
@Getter
@Setter
public class Utilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    private String position;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @ManyToOne
    @JoinColumn(name = "departement_id")
    @JsonIgnoreProperties("utilisateurs")
    private Departement departement;

    private boolean enabled = false;

    @Column(name = "token_creation_password")
    private String tokenCreationPassword;


    @Column(name = "token_expiration")
    private LocalDateTime tokenExpiration;

    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Demande> demandes;
}