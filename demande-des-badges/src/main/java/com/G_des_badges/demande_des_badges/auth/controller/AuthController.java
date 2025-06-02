package com.G_des_badges.demande_des_badges.auth.controller;

import com.G_des_badges.demande_des_badges.auth.dto.*;
import com.G_des_badges.demande_des_badges.departement.dto.DepartementDTO;
//import com.G_des_badges.demande_des_badges.departement.entity.Departement;
import com.G_des_badges.demande_des_badges.departement.repository.DepartementRepository;
import com.G_des_badges.demande_des_badges.auth.security.JwtUtils;
import com.G_des_badges.demande_des_badges.utilisateur.dto.UtilisateurResponseDTO;
import com.G_des_badges.demande_des_badges.utilisateur.entity.Utilisateur;
import com.G_des_badges.demande_des_badges.utilisateur.repository.UtilisateurRepository;
import com.G_des_badges.demande_des_badges.utilisateur.service.UtilisateurService;
import jakarta.validation.Valid;
import org.antlr.v4.runtime.Lexer;
//import org.antlr.v4.runtime.Token;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UtilisateurService utilisateurService;

    @Autowired
    private DepartementRepository departementRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private JwtUtils jwtUtils;
    private Lexer response;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequestDTO signupRequest) {
        utilisateurService.signup(signupRequest);
        return ResponseEntity.ok(new MessageResponseDTO("Inscription réussie"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
        // Authentification via le service
        Utilisateur utilisateur = utilisateurService.login(request);

        // Génération du token JWT
        String jwt = jwtUtils.generateToken(utilisateur);

        // Création de la réponse
        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(jwt);
        response.setId(utilisateur.getId());
        response.setNom(utilisateur.getNom());
        response.setPrenom(utilisateur.getPrenom());
        response.setEmail(utilisateur.getEmail());
        response.setRole(utilisateur.getRole().name());

        // ✅ Ajouter l'objet département (si présent)
        if (utilisateur.getDepartement() != null) {
            DepartementDTO departementDTO = new DepartementDTO();
            departementDTO.setId(utilisateur.getDepartement().getDepartement_id());
            departementDTO.setNomDepartement(utilisateur.getDepartement().getNomDepartement());
            response.setDepartement(departementDTO);
        } else {
            response.setDepartement(null);
        }

        return ResponseEntity.ok(response);
    }




    @PostMapping("/create-password/{token}")
    public ResponseEntity<?> createPassword(
            @PathVariable String token,
            @Valid @RequestBody SetPasswordRequestDTO passwordRequest) {

        passwordRequest.setToken(token);
        utilisateurService.createPassword(passwordRequest);
        return ResponseEntity.ok(new MessageResponseDTO("Mot de passe créé avec succès"));
    }

    @GetMapping("/pending-registrations")
    public ResponseEntity<?> getPendingRegistrations() {
        List<Utilisateur> pendingUsers = utilisateurService.getPendingRegistrations();

        List<UtilisateurResponseDTO> response = pendingUsers.stream().map(user -> {
            UtilisateurResponseDTO dto = new UtilisateurResponseDTO();
            dto.setId(user.getId());
            dto.setNom(user.getNom());
            dto.setPrenom(user.getPrenom());
            dto.setPosition(user.getPosition());
            dto.setEmail(user.getEmail());
            if (user.getDepartement() != null) {
                dto.setNomDepartement(user.getDepartement().getNomDepartement());
            }
            dto.setRole(user.getRole());
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        utilisateurService.approveUser(id);
        return ResponseEntity.ok(new MessageResponseDTO("Utilisateur approuvé avec succès"));
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<?> rejectUser(
            @PathVariable Long id,
            @RequestBody RejectRequestDTO rejectRequest) {
        utilisateurService.rejectUser(id, rejectRequest.getReason());
        return ResponseEntity.ok(new MessageResponseDTO("Utilisateur rejeté avec succès"));
    }
}