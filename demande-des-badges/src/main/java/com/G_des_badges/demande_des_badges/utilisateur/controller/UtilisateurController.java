package com.G_des_badges.demande_des_badges.utilisateur.controller;

//import com.G_des_badges.demande_des_badges.model.Role;
import com.G_des_badges.demande_des_badges.utilisateur.dto.UtilisateurResponseDTO;
import com.G_des_badges.demande_des_badges.utilisateur.entity.Utilisateur;
import com.G_des_badges.demande_des_badges.utilisateur.repository.UtilisateurRepository;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.G_des_badges.demande_des_badges.model.Role;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    @Autowired
    private UtilisateurRepository utilisateurRepository;



    private UtilisateurResponseDTO mapToDTO(Utilisateur user) {
        UtilisateurResponseDTO dto = new UtilisateurResponseDTO();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setPosition(user.getPosition());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());

        if (user.getDepartement() != null) {
            dto.setNomDepartement(user.getDepartement().getNomDepartement());
        } else {
            dto.setNomDepartement("Aucun");
        }

        return dto;
    }


    /**
     * 🔍 Affiche tous les utilisateurs (SUPERADMIN uniquement)
     */
    @GetMapping("/visible")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public List<UtilisateurResponseDTO> getUtilisateursVisibles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Utilisateur> utilisateurs;

        boolean isSuperAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPERADMIN"));

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isSuperAdmin || isAdmin) {
            utilisateurs = utilisateurRepository.findAll();
        } else {
            return List.of();
        }
        return utilisateurs.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    @GetMapping("/par-departement/{departementId}")
    public List<UtilisateurResponseDTO> getUtilisateursByDepartement(@PathVariable Long departementId) {
        List<Utilisateur> users = utilisateurRepository.findByDepartementIdAndRole(departementId, Role.EMPLOYEE);
        return users.stream().map(this::mapToDTO).collect(Collectors.toList());
    }
    /**
     * 🔄 Met à jour les informations d'un utilisateur
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'EMPLOYEE')")
    public UtilisateurResponseDTO updateUtilisateur(@PathVariable Long id, @RequestBody UtilisateurResponseDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Utilisateur currentUser = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifier si l'utilisateur est SUPERADMIN ou s'il modifie son propre profil
        boolean isSuperAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPERADMIN"));
        
        if (!isSuperAdmin && !currentUser.getId().equals(id)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier ce profil");
        }

        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // On ne modifie pas l'email, le mot de passe, le rôle ici
        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setPosition(dto.getPosition());
        // Optionnel : gérer le département si besoin
        utilisateurRepository.save(user);
        return mapToDTO(user);
    }
}
