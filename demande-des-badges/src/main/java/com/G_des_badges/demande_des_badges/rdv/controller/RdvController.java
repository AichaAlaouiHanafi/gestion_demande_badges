package com.G_des_badges.demande_des_badges.rdv.controller;

import com.G_des_badges.demande_des_badges.rdv.dto.ModifierRdvDTO;
import com.G_des_badges.demande_des_badges.rdv.dto.ProposerRdvDTO;
import com.G_des_badges.demande_des_badges.rdv.dto.RdvResponseDTO;
import com.G_des_badges.demande_des_badges.rdv.entity.RendezVous;
import com.G_des_badges.demande_des_badges.rdv.repository.RdvRepository;
import com.G_des_badges.demande_des_badges.rdv.service.RdvService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rdvs")
public class RdvController {

    @Autowired
    private RdvService rdvService;

    @Autowired
    private RdvRepository rdvRepository;

    @PostMapping("/proposer")
    public RdvResponseDTO proposer(@RequestBody ProposerRdvDTO dto) {
        return rdvService.proposerRdv(dto);
    }

    @PutMapping("/modifier")
    public RdvResponseDTO modifier(@RequestBody ModifierRdvDTO dto) {
        return rdvService.modifierRdv(dto);
    }

    @PutMapping("/confirmer/{rdvId}")
    public RdvResponseDTO confirmer(@PathVariable Long rdvId) {
        return rdvService.confirmerRdv(rdvId);
    }
    @PutMapping("/refuser/{rdvId}")
    public RdvResponseDTO refuser(@PathVariable Long rdvId) {
        return rdvService.refuserRdv(rdvId);
    }
    @GetMapping("/demande/{demandeId}")
    public List<RdvResponseDTO> getByDemande(@PathVariable Long demandeId) {
        return rdvService.getRdvsByDemande(demandeId);
    }

    @GetMapping("/utilisateur/{userId}")
    public List<RdvResponseDTO> getByUtilisateur(@PathVariable Long userId) {
        return rdvService.getRdvsByUtilisateur(userId);
    }

    @GetMapping
    public List<RdvResponseDTO> getAllRdvs() {
        return rdvService.getAllRdvs();
    }

    @PutMapping("/{rdvId}/rappel")
    public ResponseEntity<?> configurerRappel(
        @PathVariable Long rdvId,
        @RequestBody Map<String, Integer> body
    ) {
        try {
            Integer delaiRappel = body.get("delaiRappel");
            if (delaiRappel == null || (delaiRappel != 2 && delaiRappel != 24 && delaiRappel != 48)) {
                return ResponseEntity.badRequest().body("Délai de rappel invalide. Valeurs autorisées : 2, 24, 48 heures");
            }
            
            RendezVous rdv = rdvRepository.findById(rdvId)
                .orElseThrow(() -> new RuntimeException("RDV introuvable"));
            
            if (!rdv.isConfirme()) {
                return ResponseEntity.badRequest().body("Le RDV doit être confirmé pour configurer un rappel");
            }
            
            rdv.setDelaiRappel(delaiRappel);
            rdvRepository.save(rdv);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
