package com.G_des_badges.demande_des_badges.rdv.controller;

import com.G_des_badges.demande_des_badges.rdv.dto.ModifierRdvDTO;
import com.G_des_badges.demande_des_badges.rdv.dto.ProposerRdvDTO;
import com.G_des_badges.demande_des_badges.rdv.dto.RdvResponseDTO;
import com.G_des_badges.demande_des_badges.rdv.service.RdvService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rdvs")
public class RdvController {

    @Autowired
    private RdvService rdvService;

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
}
