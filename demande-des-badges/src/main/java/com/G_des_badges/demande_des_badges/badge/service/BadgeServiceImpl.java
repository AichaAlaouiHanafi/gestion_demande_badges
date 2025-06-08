package com.G_des_badges.demande_des_badges.badge.service;

import com.G_des_badges.demande_des_badges.badge.dto.BadgeRequestDTO;
import com.G_des_badges.demande_des_badges.badge.dto.BadgeResponseDTO;
import com.G_des_badges.demande_des_badges.badge.entity.Badge;
import com.G_des_badges.demande_des_badges.badge.repository.BadgeRepository;
import com.G_des_badges.demande_des_badges.utilisateur.entity.Utilisateur;
import com.G_des_badges.demande_des_badges.utilisateur.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BadgeServiceImpl implements BadgeService {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Override
    public BadgeResponseDTO createBadge(BadgeRequestDTO request) {
        Badge badge = new Badge();
        badge.setNumero(request.getNumero());
        Utilisateur utilisateur = utilisateurRepository.findById(request.getUtilisateurId()).orElse(null);
        badge.setUtilisateur(utilisateur);
        badge.setActif(true); // actif par défaut

        Badge saved = badgeRepository.save(badge);

        return mapToDTO(saved);
    }

    @Override
    public List<BadgeResponseDTO> getAllBadges() {
        return badgeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BadgeResponseDTO getBadgeById(Long id) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Badge introuvable"));
        return mapToDTO(badge);
    }

    @Override
    public void deleteBadge(Long id) {
        badgeRepository.deleteById(id);
    }

    private BadgeResponseDTO mapToDTO(Badge badge) {
        BadgeResponseDTO dto = new BadgeResponseDTO();
        dto.setId(badge.getId());
        dto.setNumero(badge.getNumero());
        dto.setActif(badge.isActif());
        dto.setUtilisateurId(badge.getUtilisateur() != null ? badge.getUtilisateur().getId() : null);
        return dto;
    }
}
