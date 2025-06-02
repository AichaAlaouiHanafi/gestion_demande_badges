package com.G_des_badges.demande_des_badges.demande.repository;

import com.G_des_badges.demande_des_badges.demande.entity.Demande;
import com.G_des_badges.demande_des_badges.model.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DemandeRepository extends JpaRepository<Demande, Long> {
    List<Demande> findByUtilisateurId(Long utilisateurId);
    List<Demande> findByStatut(StatutDemande statut);
}