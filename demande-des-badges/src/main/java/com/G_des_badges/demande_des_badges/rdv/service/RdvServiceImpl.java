package com.G_des_badges.demande_des_badges.rdv.service;

import com.G_des_badges.demande_des_badges.rdv.dto.ModifierRdvDTO;
import com.G_des_badges.demande_des_badges.rdv.dto.ProposerRdvDTO;
import com.G_des_badges.demande_des_badges.rdv.dto.RdvResponseDTO;
import com.G_des_badges.demande_des_badges.rdv.entity.RendezVous;
import com.G_des_badges.demande_des_badges.rdv.repository.RdvRepository;
import com.G_des_badges.demande_des_badges.demande.repository.DemandeRepository;
import com.G_des_badges.demande_des_badges.utilisateur.repository.UtilisateurRepository;
import com.G_des_badges.demande_des_badges.utilisateur.entity.Utilisateur;
import com.G_des_badges.demande_des_badges.model.Role;
import com.G_des_badges.demande_des_badges.model.StatutDemande;
import com.G_des_badges.demande_des_badges.notification.entity.Notification;
import com.G_des_badges.demande_des_badges.notification.repository.NotificationRepository;
import com.G_des_badges.demande_des_badges.demande.service.DemandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RdvServiceImpl implements RdvService {

    @Autowired
    private RdvRepository rdvRepository;

    @Autowired
    private DemandeRepository demandeRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private DemandeService demandeService;

    @Override
    public RdvResponseDTO proposerRdv(ProposerRdvDTO dto) {
        RendezVous rdv = new RendezVous();
        rdv.setDemandeId(dto.getDemandeId());
        rdv.setDateProposee(dto.getDateProposee());
        rdv.setModifie(false);
        rdv.setConfirme(false);
        RdvResponseDTO response = mapToDto(rdvRepository.save(rdv));
        // Mettre à jour le statut de la demande à RDV_PROPOSE
        demandeService.setStatutRdvPropose(dto.getDemandeId());
        return response;
    }

    @Override
    public List<RdvResponseDTO> getAllRdvs() {
        return rdvRepository.findAll().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Override
    public RdvResponseDTO modifierRdv(ModifierRdvDTO dto) {
        RendezVous rdv = rdvRepository.findById(dto.getRdvId())
                .orElseThrow(() -> new RuntimeException("RDV introuvable"));
        rdv.setDateProposee(dto.getNouvelleDate());
        rdv.setModifie(true);
        rdv.setDateModification(LocalDateTime.now());
        RendezVous savedRdv = rdvRepository.save(rdv);

        // Récupérer la demande et l'utilisateur
        var demande = demandeRepository.findById(rdv.getDemandeId())
            .orElseThrow(() -> new RuntimeException("Demande introuvable"));
        Utilisateur employe = utilisateurRepository.findById(demande.getUtilisateurId())
            .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // Envoi d'email à l'employé
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true);
            helper.setTo(employe.getEmail());
            helper.setSubject("Modification de votre rendez-vous");
            helper.setText("Votre nouveau rendez-vous est fixé au : " + dto.getNouvelleDate(), false);
            mailSender.send(message);
        } catch (Exception e) {
            // log erreur
        }

        // Notifier le superAdmin
        var superAdmins = utilisateurRepository.findByRole(Role.SUPERADMIN);
        for (Utilisateur superAdmin : superAdmins) {
            Notification notif = new Notification(
                "MODIFICATION_RDV",
                "Nouvelle demande de modification de RDV pour la demande #" + demande.getId() + " (employé : " + employe.getNom() + " " + employe.getPrenom() + ")",
                superAdmin.getId()
            );
            notificationRepository.save(notif);
        }

        return mapToDto(savedRdv);
    }

    @Override
    public RdvResponseDTO confirmerRdv(Long rdvId) {
        RendezVous rdv = rdvRepository.findById(rdvId)
                .orElseThrow(() -> new RuntimeException("RDV introuvable"));
        rdv.setConfirme(true);
        RdvResponseDTO response = mapToDto(rdvRepository.save(rdv));
        // Mettre à jour le statut de la demande à RDV_CONFIRME
        demandeService.setStatutRdvConfirme(rdv.getDemandeId());
        return response;
    }

    @Override
    public RdvResponseDTO refuserRdv(Long rdvId) {
        RendezVous rdv = rdvRepository.findById(rdvId)
                .orElseThrow(() -> new RuntimeException("RDV introuvable"));
        
        // Récupérer la demande et l'utilisateur pour la notification
        var demande = demandeRepository.findById(rdv.getDemandeId())
            .orElseThrow(() -> new RuntimeException("Demande introuvable"));
        Utilisateur employe = utilisateurRepository.findById(demande.getUtilisateurId())
            .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // Envoi d'email à l'employé
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true);
            helper.setTo(employe.getEmail());
            helper.setSubject("Rendez-vous refusé");
            helper.setText("Votre demande de rendez-vous a été refusée. Veuillez contacter le service des badges pour plus d'informations.", false);
            mailSender.send(message);
        } catch (Exception e) {
            // log erreur
        }

        // Notifier l'employé
        Notification notif = new Notification(
            "RDV_REFUSE",
            "Votre demande de rendez-vous a été refusée. Veuillez contacter le service des badges.",
            employe.getId()
        );
        notificationRepository.save(notif);

        // Supprimer le RDV
        rdvRepository.delete(rdv);
        
        // Mettre à jour le statut de la demande
        demande.setStatut(StatutDemande.RDV_PROPOSE);
        demandeRepository.save(demande);

        return mapToDto(rdv);
    }

    @Override
    public List<RdvResponseDTO> getRdvsByDemande(Long demandeId) {
        return rdvRepository.findByDemandeId(demandeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RdvResponseDTO> getRdvsByUtilisateur(Long utilisateurId) {
        // Récupérer toutes les demandes de l'utilisateur
        List<Long> demandeIds = demandeRepository.findByUtilisateurId(utilisateurId)
            .stream().map(d -> d.getId()).collect(Collectors.toList());
        // Récupérer tous les RDV liés à ces demandes
        return rdvRepository.findAll().stream()
            .filter(rdv -> demandeIds.contains(rdv.getDemandeId()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private RdvResponseDTO mapToDto(RendezVous rdv) {
        RdvResponseDTO dto = new RdvResponseDTO();
        dto.setId(rdv.getId());
        dto.setDemandeId(rdv.getDemandeId());
        dto.setDateProposee(rdv.getDateProposee());
        dto.setModifie(rdv.isModifie());
        dto.setConfirme(rdv.isConfirme());
        // Ajout des infos employé
        var demande = demandeRepository.findById(rdv.getDemandeId()).orElse(null);
        if (demande != null) {
            var employe = utilisateurRepository.findById(demande.getUtilisateurId()).orElse(null);
            if (employe != null) {
                dto.setNomEmploye(employe.getNom());
                dto.setPrenomEmploye(employe.getPrenom());
                dto.setEmailEmploye(employe.getEmail());
            }
        }
        dto.setDelaiRappel(rdv.getDelaiRappel());
        return dto;
    }
}
