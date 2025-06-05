package com.G_des_badges.demande_des_badges.demande.service;

import com.G_des_badges.demande_des_badges.demande.entity.Demande;
import com.G_des_badges.demande_des_badges.demande.repository.DemandeRepository;
import com.G_des_badges.demande_des_badges.model.TypeDemande;
import com.G_des_badges.demande_des_badges.notification.entity.Notification;
import com.G_des_badges.demande_des_badges.notification.repository.NotificationRepository;
import com.G_des_badges.demande_des_badges.rdv.entity.RendezVous;
import com.G_des_badges.demande_des_badges.rdv.repository.RdvRepository;
import com.G_des_badges.demande_des_badges.utilisateur.entity.Utilisateur;
import com.G_des_badges.demande_des_badges.utilisateur.repository.UtilisateurRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class RappelService {
    private static final Logger logger = LoggerFactory.getLogger(RappelService.class);

    @Autowired
    private DemandeRepository demandeRepository;
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private RdvRepository rdvRepository;

    // S'exécute toutes les minutes (pour test)
    @Scheduled(cron = "0 * * * * *")
    public void envoyerRappels() {
        logger.info("[RAPPEL] Démarrage de la vérification des rappels");
        LocalDateTime maintenant = LocalDateTime.now();
        ObjectMapper mapper = new ObjectMapper();

        // Récupérer tous les RDV confirmés avec un rappel configuré
        List<RendezVous> rdvs = rdvRepository.findAll().stream()
            .filter(rdv -> rdv.isConfirme() && rdv.getDelaiRappel() != null)
            .filter(rdv -> {
                LocalDateTime dateRdv = rdv.getDateProposee();
                if (dateRdv == null) return false;
                // Calculer la date du rappel en fonction du délai choisi
                LocalDateTime dateRappel = dateRdv.minusHours(rdv.getDelaiRappel());
                // Vérifier si c'est le moment d'envoyer le rappel (à l'heure près)
                boolean doitEnvoyer = dateRappel.getYear() == maintenant.getYear() &&
                       dateRappel.getMonth() == maintenant.getMonth() &&
                       dateRappel.getDayOfMonth() == maintenant.getDayOfMonth() &&
                       dateRappel.getHour() == maintenant.getHour();
                
                if (doitEnvoyer) {
                    logger.info("[RAPPEL] RDV trouvé pour rappel : ID={}, Date={}, Délai={}h", 
                        rdv.getId(), dateRdv, rdv.getDelaiRappel());
                }
                return doitEnvoyer;
            })
            .toList();

        logger.info("[RAPPEL] {} RDV(s) trouvé(s) pour rappel", rdvs.size());

        for (RendezVous rdv : rdvs) {
            // Récupérer la demande et l'utilisateur
            var demande = demandeRepository.findById(rdv.getDemandeId())
                .orElse(null);
            if (demande == null) {
                logger.warn("[RAPPEL] Demande non trouvée pour RDV ID={}", rdv.getId());
                continue;
            }

            Utilisateur user = utilisateurRepository.findById(demande.getUtilisateurId())
                .orElse(null);
            if (user == null) {
                logger.warn("[RAPPEL] Utilisateur non trouvé pour demande ID={}", demande.getId());
                continue;
            }

            logger.info("[RAPPEL] Préparation du rappel pour utilisateur : {} {} ({})", 
                user.getNom(), user.getPrenom(), user.getEmail());

            // Déterminer le type de rendez-vous pour le message
            String typeRdv = "badge";
            if (demande.getType() != null) {
                if (demande.getType().name().equals("DEPOT")) typeRdv = "dépôt de badge";
                else if (demande.getType().name().equals("RECUPERATION")) typeRdv = "récupération de badge";
            }

            // Créer une notification
            String message = String.format(
                "Rappel : Vous avez un rendez-vous de %s dans %d heure(s) (%s)",
                typeRdv,
                rdv.getDelaiRappel(),
                rdv.getDateProposee().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
            );

            Notification notif = new Notification(
                "RAPPEL_RDV",
                message,
                user.getId()
            );
            notificationRepository.save(notif);
            logger.info("[RAPPEL] Notification créée pour l'utilisateur ID={}", user.getId());

            // Envoyer un mail
            try {
                logger.info("[RAPPEL] Tentative d'envoi d'email à {}", user.getEmail());
                var messageMail = mailSender.createMimeMessage();
                var helper = new MimeMessageHelper(messageMail, true);
                helper.setTo(user.getEmail());
                helper.setSubject("Rappel de rendez-vous");
                helper.setText(message, false);
                mailSender.send(messageMail);
                logger.info("[RAPPEL] Email envoyé avec succès à {}", user.getEmail());
            } catch (Exception e) {
                logger.error("[RAPPEL] Erreur lors de l'envoi de l'email à {} : {}", 
                    user.getEmail(), e.getMessage(), e);
            }
        }
    }
} 