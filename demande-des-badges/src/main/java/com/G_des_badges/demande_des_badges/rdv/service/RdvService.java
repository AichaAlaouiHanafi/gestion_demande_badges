package com.G_des_badges.demande_des_badges.rdv.service;

import com.G_des_badges.demande_des_badges.rdv.dto.ModifierRdvDTO;
import com.G_des_badges.demande_des_badges.rdv.dto.ProposerRdvDTO;
import com.G_des_badges.demande_des_badges.rdv.dto.RdvResponseDTO;

import java.util.List;

public interface RdvService {
    RdvResponseDTO proposerRdv(ProposerRdvDTO dto);
    RdvResponseDTO modifierRdv(ModifierRdvDTO dto);
    RdvResponseDTO confirmerRdv(Long rdvId);
    RdvResponseDTO refuserRdv(Long rdvId);
    List<RdvResponseDTO> getRdvsByDemande(Long demandeId);
    List<RdvResponseDTO> getRdvsByUtilisateur(Long utilisateurId);
    List<RdvResponseDTO> getAllRdvs();
}
