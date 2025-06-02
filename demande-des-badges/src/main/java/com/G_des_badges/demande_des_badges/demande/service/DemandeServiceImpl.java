package com.G_des_badges.demande_des_badges.demande.service;

import com.G_des_badges.demande_des_badges.demande.dto.DemandeRequestDTO;
import com.G_des_badges.demande_des_badges.demande.dto.DemandeResponseDTO;
import com.G_des_badges.demande_des_badges.demande.entity.Demande;
import com.G_des_badges.demande_des_badges.demande.repository.DemandeRepository;
import com.G_des_badges.demande_des_badges.utilisateur.entity.Utilisateur;
import com.G_des_badges.demande_des_badges.utilisateur.repository.UtilisateurRepository;
import com.G_des_badges.demande_des_badges.model.Role;
import com.G_des_badges.demande_des_badges.model.StatutDemande;
import com.G_des_badges.demande_des_badges.notification.entity.Notification;
import com.G_des_badges.demande_des_badges.notification.repository.NotificationRepository;
import com.G_des_badges.demande_des_badges.model.TypeDemande;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DemandeServiceImpl implements DemandeService {

    private static final Logger logger = LoggerFactory.getLogger(DemandeServiceImpl.class);

    @Autowired
    private DemandeRepository demandeRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public DemandeResponseDTO demanderBadge(DemandeRequestDTO dto) {
        logger.info("[DEMANDE BADGE] Nouvelle demande reçue pour utilisateurId={}.", dto.getUtilisateurId());
        Demande demande = new Demande();
        demande.setUtilisateurId(dto.getUtilisateurId());
        demande.setFormulaire(dto.getFormulaire());
        // Statut selon le type de demande
        if (dto.getType() == TypeDemande.DEPOT || dto.getType() == TypeDemande.RECUPERATION) {
            demande.setStatut(StatutDemande.VALIDATION_ADMIN);
        } else {
            demande.setStatut(StatutDemande.DEMANDE_INITIALE);
        }
        demande.setDateDemande(LocalDateTime.now());
        if (dto.getType() != null) {
            demande.setType(dto.getType());
        } else {
            demande.setType(TypeDemande.BADGE);
        }
        Demande savedDemande = demandeRepository.save(demande);

        // Notifier tous les admins par email
        List<Utilisateur> admins = utilisateurRepository.findByRole(Role.ADMIN);
        logger.info("[DEMANDE BADGE] {} admin(s) trouvé(s) pour notification.", admins.size());
        for (Utilisateur admin : admins) {
            try {
                logger.info("[DEMANDE BADGE] Envoi d'un email à l'admin : {}", admin.getEmail());
                var message = mailSender.createMimeMessage();
                var helper = new MimeMessageHelper(message, true);
                helper.setTo(admin.getEmail());
                helper.setSubject("Nouvelle demande de badge à valider");
                String lien = "http://localhost:3001/admin/demandes";
                String htmlContent = "<p>Bonjour Admin,</p>" +
                        "<p>Un utilisateur a fait une demande de badge.</p>" +
                        "<ul>" +
                        "<li>ID utilisateur : " + dto.getUtilisateurId() + "</li>" +
                        "<li>Formulaire : " + dto.getFormulaire() + "</li>" +
                        "<li>Date de la demande : " + demande.getDateDemande() + "</li>" +
                        "</ul>" +
                        "<p><a href='" + lien + "'>Voir et valider la demande</a></p>";
                helper.setText(htmlContent, true);
                mailSender.send(message);
                logger.info("[DEMANDE BADGE] Email envoyé avec succès à {}", admin.getEmail());
            } catch (Exception e) {
                logger.error("[DEMANDE BADGE] Erreur lors de l'envoi de l'email à l'admin {} : {}", admin.getEmail(), e.getMessage(), e);
            }
        }
        // Ajout de la notification pour les admins
        Utilisateur utilisateur = utilisateurRepository.findById(dto.getUtilisateurId()).orElse(null);
        String notifMsg = "Nouvelle demande de badge de l'utilisateur : ";
        if (utilisateur != null) {
            notifMsg += utilisateur.getNom() + " " + utilisateur.getPrenom();
        } else {
            notifMsg += "ID " + dto.getUtilisateurId();
        }
        Notification notif = new Notification("BADGE_REQUEST", notifMsg, null); // null = notification globale
        notificationRepository.save(notif);
        logger.info("[NOTIF] Notification BADGE_REQUEST ajoutée !");
        return mapToDto(savedDemande);
    }

    @Override
    public DemandeResponseDTO validerParAdmin(Long id) {
        Demande demande = demandeRepository.findById(id).orElseThrow();
        demande.setStatut(StatutDemande.VALIDATION_ADMIN);
        demande.setDateValidationAdmin(LocalDateTime.now());
        return mapToDto(demandeRepository.save(demande));
    }
    @Override
    public DemandeResponseDTO refuserDemande(Long id) {
        Demande demande = demandeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        demande.setStatut(StatutDemande.REFUSEE);
        Demande saved = demandeRepository.save(demande);
        return mapToDto(saved);
    }
    @Override
    public DemandeResponseDTO validerFormulaireParAdmin(Long id) {
        Demande demande = demandeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        demande.setStatut(StatutDemande.VALIDATION_ADMIN); // <-- Cette ligne est indispensable !
        Demande saved = demandeRepository.save(demande);
        return mapToDto(saved);
    }

    @Override
    public DemandeResponseDTO validerParSuperAdmin(Long id) {
        Demande demande = demandeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        demande.setStatut(StatutDemande.VALIDATION_SUPERADMIN);
        Demande saved = demandeRepository.save(demande);
        return mapToDto(saved);
    }

    @Override
    public List<DemandeResponseDTO> getAll() {
        return demandeRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<DemandeResponseDTO> getByUtilisateur(Long utilisateurId) {
        return demandeRepository.findByUtilisateurId(utilisateurId).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private DemandeResponseDTO mapToDto(Demande demande) {
        DemandeResponseDTO dto = new DemandeResponseDTO();
        dto.setId(demande.getId());
        dto.setUtilisateurId(demande.getUtilisateurId());
        dto.setFormulaire(demande.getFormulaire());
        dto.setStatut(demande.getStatut());
        dto.setType(demande.getType());
        // Ajout nom et prénom utilisateur
        Utilisateur user = utilisateurRepository.findById(demande.getUtilisateurId()).orElse(null);
        if (user != null) {
            dto.setNomUtilisateur(user.getNom());
            dto.setPrenomUtilisateur(user.getPrenom());
        }
        return dto;
    }

    @Override
    public void setStatutRdvPropose(Long demandeId) {
        Demande demande = demandeRepository.findById(demandeId).orElseThrow();
        demande.setStatut(StatutDemande.RDV_PROPOSE);
        demandeRepository.save(demande);
    }

    @Override
    public void setStatutRdvModifie(Long demandeId) {
        Demande demande = demandeRepository.findById(demandeId).orElseThrow();
        demande.setStatut(StatutDemande.RDV_MODIFIE);
        demandeRepository.save(demande);
    }

    @Override
    public void setStatutRdvConfirme(Long demandeId) {
        Demande demande = demandeRepository.findById(demandeId).orElseThrow();
        demande.setStatut(StatutDemande.RDV_CONFIRME);
        demandeRepository.save(demande);
    }

    @Override
    public void setStatutNotifConfirmation(Long demandeId) {
        Demande demande = demandeRepository.findById(demandeId).orElseThrow();
        demande.setStatut(StatutDemande.NOTIF_CONFIRMATION);
        demandeRepository.save(demande);
    }

    @Override
    public void setStatutRappelRdv(Long demandeId) {
        Demande demande = demandeRepository.findById(demandeId).orElseThrow();
        demande.setStatut(StatutDemande.RAPPEL_RDV);
        demandeRepository.save(demande);
    }

    @Override
    public void setStatutRecuperationConfirme(Long demandeId) {
        Demande demande = demandeRepository.findById(demandeId).orElseThrow();
        demande.setStatut(StatutDemande.RECUPERATION_CONFIRME);
        demandeRepository.save(demande);
    }

    @Override
    public void setStatutDepotDemande(Long demandeId) {
        Demande demande = demandeRepository.findById(demandeId).orElseThrow();
        demande.setStatut(StatutDemande.DEPOT_DEMANDE);
        demandeRepository.save(demande);
    }

    @Override
    public void setStatutRecuperationDemande(Long demandeId) {
        Demande demande = demandeRepository.findById(demandeId).orElseThrow();
        demande.setStatut(StatutDemande.RECUPERATION_DEMANDE);
        demandeRepository.save(demande);
    }
}
