package com.G_des_badges.demande_des_badges.utilisateur.repository;

import com.G_des_badges.demande_des_badges.model.Role;
import com.G_des_badges.demande_des_badges.utilisateur.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);
    List<Utilisateur> findByEnabledFalse();
    Optional<Utilisateur> findByTokenCreationPassword(String token);


    // Utiliser une requête JPQL personnalisée
    @Query("SELECT u FROM Utilisateur u WHERE u.departement.departement_id = :departementId AND u.role = :role")
    List<Utilisateur> findByDepartementIdAndRole(
            @Param("departementId") Long departementId,
            @Param("role") Role role);

    List<Utilisateur> findByRole(Role role);
}