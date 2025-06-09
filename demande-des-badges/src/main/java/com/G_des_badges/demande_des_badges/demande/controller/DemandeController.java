package com.G_des_badges.demande_des_badges.demande.controller;

import com.G_des_badges.demande_des_badges.demande.dto.DemandeRequestDTO;
import com.G_des_badges.demande_des_badges.demande.dto.DemandeResponseDTO;
import com.G_des_badges.demande_des_badges.demande.service.DemandeService;
import com.G_des_badges.demande_des_badges.demande.entity.Demande;
import com.G_des_badges.demande_des_badges.demande.repository.DemandeRepository;
import com.G_des_badges.demande_des_badges.utilisateur.entity.Utilisateur;
import com.G_des_badges.demande_des_badges.utilisateur.repository.UtilisateurRepository;
import com.G_des_badges.demande_des_badges.model.StatutDemande;
import com.G_des_badges.demande_des_badges.model.TypeDemande;
import com.G_des_badges.demande_des_badges.auth.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.io.File;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.util.stream.Collectors;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/demandes")
public class DemandeController {

    private static final Logger logger = LoggerFactory.getLogger(DemandeController.class);

    @Autowired
    private DemandeService demandeService;

    @Autowired
    private DemandeRepository demandeRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping
    public ResponseEntity<?> demanderBadge(@RequestBody DemandeRequestDTO dto) {
        // Vérification côté backend : une seule demande en cours par type et utilisateur
        List<Demande> demandesExistantes = demandeRepository.findByUtilisateur_Id(dto.getUtilisateurId());
        
        // Filtrer uniquement les demandes du même type que la nouvelle demande
        List<Demande> demandesMemeType = demandesExistantes.stream()
            .filter(d -> d.getType() == dto.getType())
            .collect(Collectors.toList());

        // Vérifier s'il existe une demande en cours du même type
        boolean dejaEnCours = demandesMemeType.stream()
            .anyMatch(d -> d.getStatut() != StatutDemande.REFUSEE && 
                         d.getStatut() != StatutDemande.CLOTUREE);

        if (dejaEnCours) {
            String typeDemande = dto.getType().toString().toLowerCase();
            return ResponseEntity.badRequest().body(
                "Vous avez déjà une demande de " + typeDemande + " en cours. " +
                "Vous devez attendre qu'elle soit clôturée pour en faire une nouvelle. " +
                "Vous pouvez cependant faire une demande d'un autre type."
            );
        }

        DemandeResponseDTO demande = demandeService.demanderBadge(dto);
        Map<String, Object> response = new HashMap<>();
        demande.setFormulaire(dto.getFormulaire());
        response.put("demande", demande);
        response.put("message", "Votre demande a été transmise à l'admin. Vous serez notifié après validation. (Un email a été envoyé aux admins)");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/badge")
    public ResponseEntity<?> demanderBadgeFormData(
        @RequestParam String nom,
        @RequestParam String prenom,
        @RequestParam String nationalite,
        @RequestParam String filsDe,
        @RequestParam String ben,
        @RequestParam String etDe,
        @RequestParam String bent,
        @RequestParam String situationFamiliale,
        @RequestParam String nombreEnfants,
        @RequestParam String dateNaissance,
        @RequestParam String lieuNaissance,
        @RequestParam String numCIN,
        @RequestParam String dateExpirationCIN,
        @RequestParam String numPasseport,
        @RequestParam String dateDelivrancePasseport,
        @RequestParam String adresse,
        @RequestParam String ville,
        @RequestParam String organisme,
        @RequestParam String fonction,
        @RequestParam String dateRecrutement,
        @RequestParam String dejaLaissezPasser,
        @RequestParam(required = false) String numLaissezPasser,
        @RequestParam String objetAutorisation,
        @RequestParam String zonesSurete,
        @RequestParam String portesAcces,
        @RequestParam String modeReglement,
        @RequestParam(required = false) MultipartFile photoAgrafe,
        @RequestParam(required = false) MultipartFile attestationTravail,
        @RequestParam(required = false) MultipartFile photocopieCIN,
        @RequestParam(required = false) MultipartFile quitusONDA,
        @RequestParam(required = false) MultipartFile copieStatutConvention,
        @RequestParam(required = false) MultipartFile attestationStage,
        @RequestParam(required = false) Long utilisateurId,
        @RequestHeader("Authorization") String authorization
    ) throws Exception {
        // Récupérer l'utilisateur à partir du token OU du champ utilisateurId
        Long userId = utilisateurId;
        if (userId == null) {
            String token = authorization.replace("Bearer ", "");
            userId = jwtUtils.parseToken(token).get("id", Long.class);
        }
        // Construire le formulaire sous forme de JSON (ou Map)
        Map<String, Object> formulaire = new HashMap<>();
        formulaire.put("nom", nom);
        formulaire.put("prenom", prenom);
        formulaire.put("nationalite", nationalite);
        formulaire.put("filsDe", filsDe);
        formulaire.put("ben", ben);
        formulaire.put("etDe", etDe);
        formulaire.put("bent", bent);
        formulaire.put("situationFamiliale", situationFamiliale);
        formulaire.put("nombreEnfants", nombreEnfants);
        formulaire.put("dateNaissance", dateNaissance);
        formulaire.put("lieuNaissance", lieuNaissance);
        formulaire.put("numCIN", numCIN);
        formulaire.put("dateExpirationCIN", dateExpirationCIN);
        formulaire.put("numPasseport", numPasseport);
        formulaire.put("dateDelivrancePasseport", dateDelivrancePasseport);
        formulaire.put("adresse", adresse);
        formulaire.put("ville", ville);
        formulaire.put("organisme", organisme);
        formulaire.put("fonction", fonction);
        formulaire.put("dateRecrutement", dateRecrutement);
        formulaire.put("dejaLaissezPasser", dejaLaissezPasser);
        formulaire.put("numLaissezPasser", numLaissezPasser);
        formulaire.put("objetAutorisation", objetAutorisation);
        formulaire.put("zonesSurete", zonesSurete);
        formulaire.put("portesAcces", portesAcces);
        formulaire.put("modeReglement", modeReglement);
        String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator;
        new File(uploadDir).mkdirs(); // Crée le dossier si besoin

        if (photoAgrafe != null && !photoAgrafe.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + photoAgrafe.getOriginalFilename();
            File dest = new File(uploadDir + fileName);
            logger.info("[UPLOAD] Sauvegarde de photoAgrafe dans : {}", dest.getAbsolutePath());
            photoAgrafe.transferTo(dest);
            formulaire.put("photoAgrafe", fileName);
        } else {
            formulaire.put("photoAgrafe", null);
        }
        if (attestationTravail != null && !attestationTravail.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + attestationTravail.getOriginalFilename();
            File dest = new File(uploadDir + fileName);
            logger.info("[UPLOAD] Sauvegarde de attestationTravail dans : {}", dest.getAbsolutePath());
            attestationTravail.transferTo(dest);
            formulaire.put("attestationTravail", fileName);
        } else {
            formulaire.put("attestationTravail", null);
        }
        if (photocopieCIN != null && !photocopieCIN.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + photocopieCIN.getOriginalFilename();
            File dest = new File(uploadDir + fileName);
            logger.info("[UPLOAD] Sauvegarde de photocopieCIN dans : {}", dest.getAbsolutePath());
            photocopieCIN.transferTo(dest);
            formulaire.put("photocopieCIN", fileName);
        } else {
            formulaire.put("photocopieCIN", null);
        }
        if (quitusONDA != null && !quitusONDA.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + quitusONDA.getOriginalFilename();
            File dest = new File(uploadDir + fileName);
            logger.info("[UPLOAD] Sauvegarde de quitusONDA dans : {}", dest.getAbsolutePath());
            quitusONDA.transferTo(dest);
            formulaire.put("quitusONDA", fileName);
        } else {
            formulaire.put("quitusONDA", null);
        }
        if (copieStatutConvention != null && !copieStatutConvention.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + copieStatutConvention.getOriginalFilename();
            File dest = new File(uploadDir + fileName);
            logger.info("[UPLOAD] Sauvegarde de copieStatutConvention dans : {}", dest.getAbsolutePath());
            copieStatutConvention.transferTo(dest);
            formulaire.put("copieStatutConvention", fileName);
        } else {
            formulaire.put("copieStatutConvention", null);
        }
        if (attestationStage != null && !attestationStage.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + attestationStage.getOriginalFilename();
            File dest = new File(uploadDir + fileName);
            logger.info("[UPLOAD] Sauvegarde de attestationStage dans : {}", dest.getAbsolutePath());
            attestationStage.transferTo(dest);
            formulaire.put("attestationStage", fileName);
        } else {
            formulaire.put("attestationStage", null);
        }

        logger.info("[UPLOAD] Contenu du formulaire avant sérialisation : {}", formulaire);
        String formulaireJson = new ObjectMapper().writeValueAsString(formulaire);
        logger.info("[UPLOAD] JSON du formulaire à enregistrer : {}", formulaireJson);
        // Créer la demande comme avant
        Demande demande = new Demande();
        Utilisateur utilisateur = utilisateurRepository.findById(userId).orElseThrow();
        demande.setUtilisateur(utilisateur);
        demande.setFormulaire(formulaireJson);
        logger.info("[UPLOAD] Formulaire affecté à la demande : {}", demande.getFormulaire());
        demande.setStatut(StatutDemande.DEMANDE_INITIALE);
        demande.setType(TypeDemande.BADGE);
        demande.setDateDemande(LocalDateTime.now());
        Demande saved = demandeRepository.save(demande);
        logger.info("[UPLOAD] Demande sauvegardée en base avec formulaire : {}", saved.getFormulaire());
        return ResponseEntity.ok(saved);
    }
    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) throws Exception {
        String uploadDir = "uploads/";
        Resource file = new UrlResource(new File(uploadDir + filename).toURI());
        if (!file.exists() || !file.isReadable()) {
            throw new RuntimeException("Fichier non trouvé : " + filename);
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
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
        if (delaiRappel == null || delaiRappel < 1 || delaiRappel > 72) {
            return ResponseEntity.badRequest().body("Délai de rappel invalide. Valeurs autorisées : 1 à 72 heures");
        }
        demandeService.configurerRappelDemande(demandeId, delaiRappel);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/download-zip")
    public ResponseEntity<byte[]> downloadDemandeZip(@PathVariable Long id) throws IOException, DocumentException {
        Demande demande = demandeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        // Générer le PDF au design officiel
        ByteArrayOutputStream pdfOut = new ByteArrayOutputStream();
        Document pdfDoc = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter writer = PdfWriter.getInstance(pdfDoc, pdfOut);
        pdfDoc.open();
        // Logos
        Image logoONDA = Image.getInstance("src/main/resources/static/onda.png");
        logoONDA.scaleAbsolute(100, 60);
        logoONDA.setAbsolutePosition(36, 770);
        pdfDoc.add(logoONDA);
        Image logoRAM = Image.getInstance("src/main/resources/static/ram.png");
        logoRAM.scaleAbsolute(100, 60);
        logoRAM.setAbsolutePosition(440, 770);
        pdfDoc.add(logoRAM);
        // Titre principal
        Font titreFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
        Paragraph titre = new Paragraph("PERMIS D'ACCES TEMPORAIRE\nZone Réglementée", titreFont);
        titre.setAlignment(Element.ALIGN_CENTER);
        titre.setSpacingBefore(30);
        pdfDoc.add(titre);
        // Section A
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.WHITE);
        PdfPTable sectionATable = new PdfPTable(1);
        sectionATable.setWidthPercentage(100);
        PdfPCell cellA = new PdfPCell(new Phrase("A   LES INFORMATIONS PERSONNELLES", sectionFont));
        cellA.setBackgroundColor(new BaseColor(36, 61, 97));
        cellA.setBorder(Rectangle.NO_BORDER);
        cellA.setPadding(8);
        sectionATable.addCell(cellA);
        pdfDoc.add(sectionATable);
        // Table infos personnelles
        Font labelFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
        Font valueFont = new Font(Font.FontFamily.HELVETICA, 10);
        PdfPTable persoTable = new PdfPTable(new float[]{1.5f, 2f, 1.5f, 2f});
        persoTable.setWidthPercentage(100);
        persoTable.setSpacingBefore(8);
        Map<String, Object> formMap = new ObjectMapper().readValue(demande.getFormulaire(), Map.class);
        String nom = (String) formMap.getOrDefault("nom", "");
        String prenom = (String) formMap.getOrDefault("prenom", "");
        String filsDe = (String) formMap.getOrDefault("filsDe", "");
        String ben = (String) formMap.getOrDefault("ben", "");
        String etDe = (String) formMap.getOrDefault("etDe", "");
        String bent = (String) formMap.getOrDefault("bent", "");
        String nationalite = (String) formMap.getOrDefault("nationalite", "");
        String ville = (String) formMap.getOrDefault("ville", "");
        String situationFamiliale = (String) formMap.getOrDefault("situationFamiliale", "");
        String nombreEnfants = (String) formMap.getOrDefault("nombreEnfants", "");
        String dateNaissance = (String) formMap.getOrDefault("dateNaissance", "");
        String lieuNaissance = (String) formMap.getOrDefault("lieuNaissance", "");
        String numCIN = (String) formMap.getOrDefault("numCIN", "");
        String dateExpirationCIN = (String) formMap.getOrDefault("dateExpirationCIN", "");
        String numPasseport = (String) formMap.getOrDefault("numPasseport", "");
        String dateDelivrancePasseport = (String) formMap.getOrDefault("dateDelivrancePasseport", "");
        String adresse = (String) formMap.getOrDefault("adresse", "");
        // Ligne 1
        persoTable.addCell(new Phrase("Nom", labelFont));
        persoTable.addCell(new Phrase(": " + nom, valueFont));
        persoTable.addCell(new Phrase("Prénom", labelFont));
        persoTable.addCell(new Phrase(": " + prenom, valueFont));
        // Ligne 2
        persoTable.addCell(new Phrase("fil de", labelFont));
        persoTable.addCell(new Phrase(": " + filsDe, valueFont));
        persoTable.addCell(new Phrase("Ben", labelFont));
        persoTable.addCell(new Phrase(": " + ben, valueFont));
        // Ligne 3
        persoTable.addCell(new Phrase("et de", labelFont));
        persoTable.addCell(new Phrase(": " + etDe, valueFont));
        persoTable.addCell(new Phrase("Bent", labelFont));
        persoTable.addCell(new Phrase(": " + bent, valueFont));
        // Ligne 4
        persoTable.addCell(new Phrase("lieu de naissance", labelFont));
        persoTable.addCell(new Phrase(": " + lieuNaissance, valueFont));
        persoTable.addCell(new Phrase("Date de naissance", labelFont));
        persoTable.addCell(new Phrase(": " + dateNaissance, valueFont));
        // Ligne 5
        persoTable.addCell(new Phrase("Nationalité", labelFont));
        persoTable.addCell(new Phrase(": " + nationalite, valueFont));
        persoTable.addCell(new Phrase("Ville", labelFont));
        persoTable.addCell(new Phrase(": " + ville, valueFont));
        // Ligne 6
        persoTable.addCell(new Phrase("situation familiale", labelFont));
        persoTable.addCell(new Phrase(": " + situationFamiliale, valueFont));
        persoTable.addCell(new Phrase("Nombre d'enfant", labelFont));
        persoTable.addCell(new Phrase(": " + nombreEnfants, valueFont));
        // Ligne 7
        persoTable.addCell(new Phrase("N C.I.N", labelFont));
        persoTable.addCell(new Phrase(": " + numCIN, valueFont));
        persoTable.addCell(new Phrase("Date d'expiration", labelFont));
        persoTable.addCell(new Phrase(": " + dateExpirationCIN, valueFont));
        // Ligne 8
        persoTable.addCell(new Phrase("N Passport", labelFont));
        persoTable.addCell(new Phrase(": " + numPasseport, valueFont));
        persoTable.addCell(new Phrase("Date de délivrance", labelFont));
        persoTable.addCell(new Phrase(": " + dateDelivrancePasseport, valueFont));
        // Ligne 9
        persoTable.addCell(new Phrase("Adresse personnelle", labelFont));
        PdfPCell adresseCell = new PdfPCell(new Phrase(": " + adresse, valueFont));
        adresseCell.setColspan(3);
        persoTable.addCell(adresseCell);
        pdfDoc.add(persoTable);
        // Section B
        PdfPTable sectionBTable = new PdfPTable(1);
        sectionBTable.setWidthPercentage(100);
        PdfPCell cellB = new PdfPCell(new Phrase("B   INFORMATIONS PROFESSIONNELLES ET ACCÈS ORGANISME EMPLOYEUR", sectionFont));
        cellB.setBackgroundColor(new BaseColor(36, 61, 97));
        cellB.setBorder(Rectangle.NO_BORDER);
        cellB.setPadding(8);
        sectionBTable.addCell(cellB);
        sectionBTable.setSpacingBefore(16);
        pdfDoc.add(sectionBTable);
        // Table infos professionnelles
        PdfPTable proTable = new PdfPTable(new float[]{2f, 2f, 2f, 2f});
        proTable.setWidthPercentage(100);
        proTable.setSpacingBefore(8);
        String organisme = (String) formMap.getOrDefault("organisme", "");
        String fonction = (String) formMap.getOrDefault("fonction", "");
        String dateRecrutement = (String) formMap.getOrDefault("dateRecrutement", "");
        String dejaLaissezPasser = (String) formMap.getOrDefault("dejaLaissezPasser", "");
        String typeLaissezPasser = (String) formMap.getOrDefault("typeLaissezPasser", "");
        String numLaissezPasser = (String) formMap.getOrDefault("numLaissezPasser", "");
        String objetAutorisation = (String) formMap.getOrDefault("objetAutorisation", "");
        String zonesSurete = (String) formMap.getOrDefault("zonesSurete", "");
        String modeReglement = (String) formMap.getOrDefault("modeReglement", "");
        // Ligne 1
        proTable.addCell(new Phrase("Organisme employeur", labelFont));
        proTable.addCell(new Phrase(": " + organisme, valueFont));
        proTable.addCell(new Phrase("Fonction", labelFont));
        proTable.addCell(new Phrase(": " + fonction, valueFont));
        // Ligne 2
        proTable.addCell(new Phrase("Date de recrutement", labelFont));
        proTable.addCell(new Phrase(": " + dateRecrutement, valueFont));
        proTable.addCell(new Phrase("Avez-vous déjà un laissez-passer", labelFont));
        proTable.addCell(new Phrase(": " + dejaLaissezPasser, valueFont));
        // Ligne 3
        proTable.addCell(new Phrase("Type", labelFont));
        proTable.addCell(new Phrase(": " + typeLaissezPasser, valueFont));
        proTable.addCell(new Phrase("Numéro", labelFont));
        proTable.addCell(new Phrase(": " + numLaissezPasser, valueFont));
        // Ligne 4
        proTable.addCell(new Phrase("Objet de l'autorisation d'accès", labelFont));
        PdfPCell objetCell = new PdfPCell(new Phrase(": " + objetAutorisation, valueFont));
        objetCell.setColspan(3);
        proTable.addCell(objetCell);
        // Ligne 5
        proTable.addCell(new Phrase("Zones de sûreté proposées", labelFont));
        PdfPCell zonesCell = new PdfPCell(new Phrase(": " + zonesSurete, valueFont));
        zonesCell.setColspan(3);
        proTable.addCell(zonesCell);
        // Ligne 6
        proTable.addCell(new Phrase("Mode de règlement", labelFont));
        PdfPCell modeCell = new PdfPCell(new Phrase(": " + modeReglement, valueFont));
        modeCell.setColspan(3);
        proTable.addCell(modeCell);
        pdfDoc.add(proTable);
        // Signature
        Paragraph signature = new Paragraph("\n\nSignature", new Font(Font.FontFamily.HELVETICA, 14, Font.ITALIC));
        signature.setAlignment(Element.ALIGN_RIGHT);
        signature.setSpacingBefore(30);
        pdfDoc.add(signature);
        pdfDoc.close();
        // Créer le ZIP
        ByteArrayOutputStream zipOut = new ByteArrayOutputStream();
        ZipOutputStream zos = new ZipOutputStream(zipOut);
        // Ajouter le PDF
        zos.putNextEntry(new ZipEntry("formulaire.pdf"));
        zos.write(pdfOut.toByteArray());
        zos.closeEntry();
        // Ajouter les fichiers uploadés
        String uploadDir = System.getProperty("user.dir") + java.io.File.separator + "uploads" + java.io.File.separator;
        for (Map.Entry<String, Object> entry : formMap.entrySet()) {
            if (entry.getValue() != null && entry.getValue() instanceof String) {
                String fileName = (String) entry.getValue();
                if (fileName.endsWith(".pdf") || fileName.endsWith(".jpg") || fileName.endsWith(".png")) {
                    java.io.File file = new java.io.File(uploadDir + fileName);
                    if (file.exists()) {
                        zos.putNextEntry(new ZipEntry(fileName));
                        FileInputStream fis = new FileInputStream(file);
                        byte[] buffer = new byte[4096];
                        int len;
                        while ((len = fis.read(buffer)) > 0) {
                            zos.write(buffer, 0, len);
                        }
                        fis.close();
                        zos.closeEntry();
                    }
                }
            }
        }
        zos.close();
        byte[] zipBytes = zipOut.toByteArray();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=demande_" + id + ".zip")
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(zipBytes);
    }

    @PutMapping("/{id}/confirmer-retrait")
    public DemandeResponseDTO confirmerRetraitBadge(@PathVariable Long id) {
        Demande demande = demandeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        demande.setStatut(StatutDemande.BADGE_RECUPERE);
        demandeRepository.save(demande);
        return demandeService.getAll().stream().filter(d -> d.getId().equals(id)).findFirst().orElse(null);
    }

    @PostMapping("/{id}/cloturer")
    public ResponseEntity<?> cloturerDemande(@PathVariable Long id, Authentication authentication) {
        try {
            // Vérifier que l'utilisateur est authentifié
            if (authentication == null) {
                return ResponseEntity.status(401).body("Non autorisé");
            }

            // Vérifier que l'utilisateur est bien l'auteur de la demande
            Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
            
            String username = authentication.getName();
            Utilisateur utilisateur = utilisateurRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            if (!demande.getUtilisateur().getId().equals(utilisateur.getId())) {
                return ResponseEntity.status(403).body("Vous n'êtes pas autorisé à clôturer cette demande");
            }

            DemandeResponseDTO demandeCloturee = demandeService.cloturerDemande(id);
            return ResponseEntity.ok(demandeCloturee);
        } catch (RuntimeException e) {
            logger.error("Erreur lors de la clôture de la demande", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/formulaire-pdf")
    public ResponseEntity<byte[]> downloadFormulairePdf(@PathVariable Long id) throws IOException, DocumentException {
        Demande demande = demandeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        // Générer le PDF au design officiel
        ByteArrayOutputStream pdfOut = new ByteArrayOutputStream();
        Document pdfDoc = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter writer = PdfWriter.getInstance(pdfDoc, pdfOut);
        pdfDoc.open();
        // Logos
        Image logoONDA = Image.getInstance("src/main/resources/static/onda.png");
        logoONDA.scaleAbsolute(100, 60);
        logoONDA.setAbsolutePosition(36, 770);
        pdfDoc.add(logoONDA);
        Image logoRAM = Image.getInstance("src/main/resources/static/ram.png");
        logoRAM.scaleAbsolute(100, 60);
        logoRAM.setAbsolutePosition(440, 770);
        pdfDoc.add(logoRAM);
        // Titre principal
        Font titreFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
        Paragraph titre = new Paragraph("PERMIS D'ACCES TEMPORAIRE\nZone Réglementée", titreFont);
        titre.setAlignment(Element.ALIGN_CENTER);
        titre.setSpacingBefore(30);
        pdfDoc.add(titre);
        // Section A
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.WHITE);
        PdfPTable sectionATable = new PdfPTable(1);
        sectionATable.setWidthPercentage(100);
        PdfPCell cellA = new PdfPCell(new Phrase("A   LES INFORMATIONS PERSONNELLES", sectionFont));
        cellA.setBackgroundColor(new BaseColor(36, 61, 97));
        cellA.setBorder(Rectangle.NO_BORDER);
        cellA.setPadding(8);
        sectionATable.addCell(cellA);
        pdfDoc.add(sectionATable);
        // Table infos personnelles
        Font labelFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
        Font valueFont = new Font(Font.FontFamily.HELVETICA, 10);
        PdfPTable persoTable = new PdfPTable(new float[]{1.5f, 2f, 1.5f, 2f});
        persoTable.setWidthPercentage(100);
        persoTable.setSpacingBefore(8);
        Map<String, Object> formMap = new ObjectMapper().readValue(demande.getFormulaire(), Map.class);
        String nom = (String) formMap.getOrDefault("nom", "");
        String prenom = (String) formMap.getOrDefault("prenom", "");
        String filsDe = (String) formMap.getOrDefault("filsDe", "");
        String ben = (String) formMap.getOrDefault("ben", "");
        String etDe = (String) formMap.getOrDefault("etDe", "");
        String bent = (String) formMap.getOrDefault("bent", "");
        String nationalite = (String) formMap.getOrDefault("nationalite", "");
        String ville = (String) formMap.getOrDefault("ville", "");
        String situationFamiliale = (String) formMap.getOrDefault("situationFamiliale", "");
        String nombreEnfants = (String) formMap.getOrDefault("nombreEnfants", "");
        String dateNaissance = (String) formMap.getOrDefault("dateNaissance", "");
        String lieuNaissance = (String) formMap.getOrDefault("lieuNaissance", "");
        String numCIN = (String) formMap.getOrDefault("numCIN", "");
        String dateExpirationCIN = (String) formMap.getOrDefault("dateExpirationCIN", "");
        String numPasseport = (String) formMap.getOrDefault("numPasseport", "");
        String dateDelivrancePasseport = (String) formMap.getOrDefault("dateDelivrancePasseport", "");
        String adresse = (String) formMap.getOrDefault("adresse", "");
        // Ligne 1
        persoTable.addCell(new Phrase("Nom", labelFont));
        persoTable.addCell(new Phrase(": " + nom, valueFont));
        persoTable.addCell(new Phrase("Prénom", labelFont));
        persoTable.addCell(new Phrase(": " + prenom, valueFont));
        // Ligne 2
        persoTable.addCell(new Phrase("fil de", labelFont));
        persoTable.addCell(new Phrase(": " + filsDe, valueFont));
        persoTable.addCell(new Phrase("Ben", labelFont));
        persoTable.addCell(new Phrase(": " + ben, valueFont));
        // Ligne 3
        persoTable.addCell(new Phrase("et de", labelFont));
        persoTable.addCell(new Phrase(": " + etDe, valueFont));
        persoTable.addCell(new Phrase("Bent", labelFont));
        persoTable.addCell(new Phrase(": " + bent, valueFont));
        // Ligne 4
        persoTable.addCell(new Phrase("lieu de naissance", labelFont));
        persoTable.addCell(new Phrase(": " + lieuNaissance, valueFont));
        persoTable.addCell(new Phrase("Date de naissance", labelFont));
        persoTable.addCell(new Phrase(": " + dateNaissance, valueFont));
        // Ligne 5
        persoTable.addCell(new Phrase("Nationalité", labelFont));
        persoTable.addCell(new Phrase(": " + nationalite, valueFont));
        persoTable.addCell(new Phrase("Ville", labelFont));
        persoTable.addCell(new Phrase(": " + ville, valueFont));
        // Ligne 6
        persoTable.addCell(new Phrase("situation familiale", labelFont));
        persoTable.addCell(new Phrase(": " + situationFamiliale, valueFont));
        persoTable.addCell(new Phrase("Nombre d'enfant", labelFont));
        persoTable.addCell(new Phrase(": " + nombreEnfants, valueFont));
        // Ligne 7
        persoTable.addCell(new Phrase("N C.I.N", labelFont));
        persoTable.addCell(new Phrase(": " + numCIN, valueFont));
        persoTable.addCell(new Phrase("Date d'expiration", labelFont));
        persoTable.addCell(new Phrase(": " + dateExpirationCIN, valueFont));
        // Ligne 8
        persoTable.addCell(new Phrase("N Passport", labelFont));
        persoTable.addCell(new Phrase(": " + numPasseport, valueFont));
        persoTable.addCell(new Phrase("Date de délivrance", labelFont));
        persoTable.addCell(new Phrase(": " + dateDelivrancePasseport, valueFont));
        // Ligne 9
        persoTable.addCell(new Phrase("Adresse personnelle", labelFont));
        PdfPCell adresseCell = new PdfPCell(new Phrase(": " + adresse, valueFont));
        adresseCell.setColspan(3);
        persoTable.addCell(adresseCell);
        pdfDoc.add(persoTable);
        // Section B
        PdfPTable sectionBTable = new PdfPTable(1);
        sectionBTable.setWidthPercentage(100);
        PdfPCell cellB = new PdfPCell(new Phrase("B   INFORMATIONS PROFESSIONNELLES ET ACCÈS ORGANISME EMPLOYEUR", sectionFont));
        cellB.setBackgroundColor(new BaseColor(36, 61, 97));
        cellB.setBorder(Rectangle.NO_BORDER);
        cellB.setPadding(8);
        sectionBTable.addCell(cellB);
        sectionBTable.setSpacingBefore(16);
        pdfDoc.add(sectionBTable);
        // Table infos professionnelles
        PdfPTable proTable = new PdfPTable(new float[]{2f, 2f, 2f, 2f});
        proTable.setWidthPercentage(100);
        proTable.setSpacingBefore(8);
        String organisme = (String) formMap.getOrDefault("organisme", "");
        String fonction = (String) formMap.getOrDefault("fonction", "");
        String dateRecrutement = (String) formMap.getOrDefault("dateRecrutement", "");
        String dejaLaissezPasser = (String) formMap.getOrDefault("dejaLaissezPasser", "");
        String typeLaissezPasser = (String) formMap.getOrDefault("typeLaissezPasser", "");
        String numLaissezPasser = (String) formMap.getOrDefault("numLaissezPasser", "");
        String objetAutorisation = (String) formMap.getOrDefault("objetAutorisation", "");
        String zonesSurete = (String) formMap.getOrDefault("zonesSurete", "");
        String modeReglement = (String) formMap.getOrDefault("modeReglement", "");
        // Ligne 1
        proTable.addCell(new Phrase("Organisme employeur", labelFont));
        proTable.addCell(new Phrase(": " + organisme, valueFont));
        proTable.addCell(new Phrase("Fonction", labelFont));
        proTable.addCell(new Phrase(": " + fonction, valueFont));
        // Ligne 2
        proTable.addCell(new Phrase("Date de recrutement", labelFont));
        proTable.addCell(new Phrase(": " + dateRecrutement, valueFont));
        proTable.addCell(new Phrase("Avez-vous déjà un laissez-passer", labelFont));
        proTable.addCell(new Phrase(": " + dejaLaissezPasser, valueFont));
        // Ligne 3
        proTable.addCell(new Phrase("Type", labelFont));
        proTable.addCell(new Phrase(": " + typeLaissezPasser, valueFont));
        proTable.addCell(new Phrase("Numéro", labelFont));
        proTable.addCell(new Phrase(": " + numLaissezPasser, valueFont));
        // Ligne 4
        proTable.addCell(new Phrase("Objet de l'autorisation d'accès", labelFont));
        PdfPCell objetCell = new PdfPCell(new Phrase(": " + objetAutorisation, valueFont));
        objetCell.setColspan(3);
        proTable.addCell(objetCell);
        // Ligne 5
        proTable.addCell(new Phrase("Zones de sûreté proposées", labelFont));
        PdfPCell zonesCell = new PdfPCell(new Phrase(": " + zonesSurete, valueFont));
        zonesCell.setColspan(3);
        proTable.addCell(zonesCell);
        // Ligne 6
        proTable.addCell(new Phrase("Mode de règlement", labelFont));
        PdfPCell modeCell = new PdfPCell(new Phrase(": " + modeReglement, valueFont));
        modeCell.setColspan(3);
        proTable.addCell(modeCell);
        pdfDoc.add(proTable);
        // Signature
        Paragraph signature = new Paragraph("\n\nSignature", new Font(Font.FontFamily.HELVETICA, 14, Font.ITALIC));
        signature.setAlignment(Element.ALIGN_RIGHT);
        signature.setSpacingBefore(30);
        pdfDoc.add(signature);
        pdfDoc.close();
        byte[] pdfBytes = pdfOut.toByteArray();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=formulaire_" + id + ".pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdfBytes);
    }

    @GetMapping("/par-departement")
    @PreAuthorize("hasRole('ADMIN')")
    public List<DemandeResponseDTO> getDemandesParDepartement(Authentication authentication) {
        String email = authentication.getName();
        Utilisateur admin = utilisateurRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Admin non trouvé"));
        if (admin.getDepartement() == null) {
            return List.of();
        }
        Long departementId = admin.getDepartement().getDepartement_id();
        List<Demande> demandes = demandeRepository.findAll()
            .stream()
            .filter(d -> d.getUtilisateur() != null && d.getUtilisateur().getDepartement() != null
                && d.getUtilisateur().getDepartement().getDepartement_id().equals(departementId))
            .collect(Collectors.toList());
        return demandeService.mapToDtoList(demandes);
    }
}
