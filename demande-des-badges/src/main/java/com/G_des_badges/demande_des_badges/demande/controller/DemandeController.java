package com.G_des_badges.demande_des_badges.demande.controller;

import com.G_des_badges.demande_des_badges.demande.dto.DemandeRequestDTO;
import com.G_des_badges.demande_des_badges.demande.dto.DemandeResponseDTO;
import com.G_des_badges.demande_des_badges.demande.service.DemandeService;
import com.G_des_badges.demande_des_badges.demande.entity.Demande;
import com.G_des_badges.demande_des_badges.demande.repository.DemandeRepository;
import com.G_des_badges.demande_des_badges.utilisateur.entity.Utilisateur;
import com.G_des_badges.demande_des_badges.utilisateur.repository.UtilisateurRepository;
import com.G_des_badges.demande_des_badges.model.StatutDemande;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/demandes")
public class DemandeController {

    @Autowired
    private DemandeService demandeService;

    @Autowired
    private DemandeRepository demandeRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @PostMapping
    public ResponseEntity<?> demanderBadge(@RequestBody DemandeRequestDTO dto) {
        DemandeResponseDTO demande = demandeService.demanderBadge(dto);
        Map<String, Object> response = new HashMap<>();
        demande.setFormulaire(dto.getFormulaire());
        response.put("demande", demande);
        response.put("message", "Votre demande a été transmise à l'admin. Vous serez notifié après validation. (Un email a été envoyé aux admins)");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/valider/admin/{id}")
    public DemandeResponseDTO validerParAdmin(@PathVariable Long id) {
        return demandeService.validerParAdmin(id);
    }

    @PutMapping("/valider/superadmin/{id}")
    public DemandeResponseDTO validerParSuperAdmin(@PathVariable Long id) {
        return demandeService.validerParSuperAdmin(id);
    }

    @GetMapping
    public List<DemandeResponseDTO> getAll() {
        return demandeService.getAll();
    }

    @GetMapping("/utilisateur/{userId}")
    public List<DemandeResponseDTO> getByUtilisateur(@PathVariable Long userId) {
        return demandeService.getByUtilisateur(userId);
    }

    @GetMapping("/{demandeId}/formulaire")
    public ResponseEntity<?> getFormulairePourEmploye(@PathVariable Long demandeId) {
        Demande demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        String formulaire = demande.getFormulaire();
        if (formulaire == null || formulaire.isEmpty()) {
            formulaire = "{}";
        }
        return ResponseEntity.ok(formulaire);
    }

    @PutMapping("/{id}/formulaire")
    public DemandeResponseDTO remplirFormulaire(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Demande demande = demandeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        demande.setFormulaire((String) body.get("formulaire"));
        demandeRepository.save(demande);
        return demandeService.getAll().stream().filter(d -> d.getId().equals(id)).findFirst().orElse(null);
    }

    @PutMapping("/valider-formulaire/admin/{id}")
    public DemandeResponseDTO validerFormulaireParAdmin(@PathVariable Long id) {
        return demandeService.validerFormulaireParAdmin(id);
    }

    @GetMapping("/mes-demandes")
    public List<DemandeResponseDTO> getMesDemandes(Authentication authentication) {
        String email = authentication.getName();
        Utilisateur user = utilisateurRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return demandeService.getByUtilisateur(user.getId());
    }

    @PutMapping("/{id}/refuser")
    public DemandeResponseDTO refuserDemande(@PathVariable Long id) {
        return demandeService.refuserDemande(id);
    }

    @PutMapping("/{demandeId}/rappel")
    public ResponseEntity<?> configurerRappelDemande(@PathVariable Long demandeId, @RequestBody Map<String, Integer> body) {
        Integer delaiRappel = body.get("delaiRappel");
        if (delaiRappel == null || (delaiRappel != 2 && delaiRappel != 24 && delaiRappel != 48)) {
            return ResponseEntity.badRequest().body("Délai de rappel invalide. Valeurs autorisées : 2, 24, 48 heures");
        }
        demandeService.configurerRappelDemande(demandeId, delaiRappel);
        return ResponseEntity.ok().build();
    }
}
