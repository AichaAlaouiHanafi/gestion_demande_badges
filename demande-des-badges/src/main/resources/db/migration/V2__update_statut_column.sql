-- Mise à jour de la colonne statut pour utiliser l'enum
ALTER TABLE demandes MODIFY COLUMN statut VARCHAR(50);

-- Mise à jour des valeurs existantes
UPDATE demandes SET statut = 'DEMANDE_INITIALE' WHERE statut = 'EN_ATTENTE';
UPDATE demandes SET statut = 'VALIDATION_ADMIN' WHERE statut = 'VALIDE_ADMIN';
UPDATE demandes SET statut = 'VALIDATION_SUPERADMIN' WHERE statut = 'VALIDE_SUPERADMIN';
UPDATE demandes SET statut = 'FORMULAIRE_REMPLI' WHERE statut = 'FORMULAIRE_REMPLI';
-- Les autres statuts seront ajoutés automatiquement lors de leur première utilisation 