package com.G_des_badges.demande_des_badges.utilisateur.service;

import com.G_des_badges.demande_des_badges.auth.dto.*;
import com.G_des_badges.demande_des_badges.departement.entity.Departement;
import com.G_des_badges.demande_des_badges.departement.repository.DepartementRepository;
import com.G_des_badges.demande_des_badges.model.Role;
import com.G_des_badges.demande_des_badges.utilisateur.entity.Utilisateur;
import com.G_des_badges.demande_des_badges.utilisateur.repository.UtilisateurRepository;
import com.G_des_badges.demande_des_badges.notification.entity.Notification;
import com.G_des_badges.demande_des_badges.notification.repository.NotificationRepository;
import jakarta.transaction.Transactional;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final DepartementRepository departementRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;
    private final NotificationRepository notificationRepository;

    public UtilisateurService(UtilisateurRepository utilisateurRepository,
                              DepartementRepository departementRepository,
                              JavaMailSender mailSender,
                              PasswordEncoder passwordEncoder,
                              NotificationRepository notificationRepository) {
        this.utilisateurRepository = utilisateurRepository;
        this.departementRepository = departementRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
        this.notificationRepository = notificationRepository;
    }

    public void signup(SignupRequestDTO dto) {
        Departement departement = departementRepository.findById(dto.getDepartementId())
                .orElseThrow(() -> new RuntimeException("Département non trouvé"));

        Utilisateur user = new Utilisateur();
        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setPosition(dto.getPosition());
        user.setEmail(dto.getEmail());
        user.setRole(Role.EMPLOYEE);
        user.setEnabled(false);
        user.setDepartement(departement);

        utilisateurRepository.save(user);

        // Ajout de la notification d'inscription en attente
        String notifMsg = "Nouvelle inscription en attente : " + user.getNom() + " " + user.getPrenom();
        Notification notif = new Notification("SIGNUP", notifMsg, null); // null = notification globale
        notificationRepository.save(notif);
    }

    public List<Utilisateur> getPendingRegistrations() {
        return utilisateurRepository.findByEnabledFalse();
    }

    @Transactional
    public void approveUser(Long id) {
        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String token = UUID.randomUUID().toString();
        user.setTokenCreationPassword(token);
        user.setTokenExpiration(LocalDateTime.now().plusDays(1));

        utilisateurRepository.save(user);

        String link = "http://localhost:3001/create-password/" + token;
        sendEmail(user.getEmail(), link);
    }

    public void rejectUser(Long id, String reason) {
        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        utilisateurRepository.delete(user);
        // Optionnel : envoyer un email avec la raison du rejet
    }

    @Transactional
    public void createPassword(SetPasswordRequestDTO dto) {
        Utilisateur user = utilisateurRepository.findByTokenCreationPassword(dto.getToken())
                .orElseThrow(() -> new RuntimeException("Token invalide"));

        if (user.getTokenExpiration().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expiré");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        user.setEnabled(true);
        user.setTokenCreationPassword(null);
        user.setTokenExpiration(null);
        utilisateurRepository.save(user);
    }

    public Utilisateur login(LoginRequestDTO dto) {
        Utilisateur user = utilisateurRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        if (!user.isEnabled()) {
            throw new RuntimeException("Utilisateur inactif");
        }

        // ✅ Supprimer ce bloc si tu veux activer la vraie vérification
        // System.out.println(" [DEV MODE] Bypass du mot de passe activé !");
        // return user;

        // ✅ Vérification du mot de passe
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Mot de passe incorrect");
        }

        return user;
    }


    public Optional<Utilisateur> findByEmail(String email) {
        return utilisateurRepository.findByEmail(email);
    }

    private void sendEmail(String to, String link) {
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject("Création de votre mot de passe");
            String htmlContent = "<p>Bonjour,</p>" +
                    "<p>Veuillez cliquer sur le lien suivant pour créer votre mot de passe :</p>" +
                    "<p><a href=\"" + link + "\">Créer mon mot de passe</a></p>" +
                    "<p>Ce lien est valable 24h.</p>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Échec de l'envoi de l'e-mail", e);
        }
    }
}
