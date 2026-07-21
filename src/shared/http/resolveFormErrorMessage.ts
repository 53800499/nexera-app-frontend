import { ApiValidationError } from "@/shared/core/ApiValidationError";
import { AppError } from "@/shared/core/AppError";
import { isOfflineError } from "@/shared/core/OfflineError";

const BUSINESS_MESSAGE_PATTERNS: { pattern: RegExp; message: string }[] = [
  {
    pattern:
      /recipientEmail|recipient.?email|destinataire.*e-?mail|email.*destinataire/i,
    message: "Adresse e-mail du destinataire invalide ou manquante.",
  },
  {
    pattern:
      /client.*(has no|without|missing|no).*email|email.*(not found|missing|required)|sans.*e-?mail|adresse.*e-?mail.*(manquante|absente|requise)/i,
    message:
      "Le client n'a pas d'adresse e-mail. Complétez la fiche client avant l'envoi.",
  },
  {
    pattern:
      /smtp|mail.*(fail|error|reject)|e-?mail.*(fail|échec|impossible)|delivery failed|envoi.*mail.*échou/i,
    message:
      "L'envoi de l'e-mail a échoué. Vérifiez la configuration e-mail dans Paramètres.",
  },
  {
    pattern: /email.?template|template.*(email|mail)|modèle.*(e-?mail|mail)/i,
    message:
      "Le modèle d'e-mail n'est pas configuré. Complétez les paramètres d'envoi.",
  },
  {
    pattern:
      /cannot.*(send|transition)|can not.*(send|transition)|invalid.*transition|transition.*not allowed|impossible.*(envoy|transition)/i,
    message: "Le statut actuel du document ne permet pas cette action.",
  },
  {
    pattern:
      /must be (issued|sent|draft)|only.*(draft|issued).*can|doit être (émis|envoyé|brouillon)/i,
    message:
      "Le document doit être émis ou dans le bon statut avant l'envoi au client.",
  },
  {
    pattern: /already (sent|issued|converted)|déjà (envoyé|émis|converti)/i,
    message: "Cette action a déjà été effectuée sur ce document.",
  },
  {
    pattern: /expired|expiré/i,
    message:
      "Ce document est expiré et ne peut plus être envoyé ni modifié.",
  },
  {
    pattern: /offline|connexion requise|network|fetch failed|failed to fetch/i,
    message:
      "Connexion requise. Vérifiez votre réseau ou réessayez une fois en ligne.",
  },
  {
    pattern: /quotation.*(send|sent)|devis.*envoy|send.*quotation/i,
    message:
      "Impossible d'envoyer ce devis. Vérifiez le statut, l'e-mail du client et les paramètres d'envoi.",
  },
  {
    pattern: /invoice.*(send|sent)|facture.*envoy|send.*invoice/i,
    message:
      "Impossible d'envoyer cette facture. Vérifiez le statut, l'e-mail du client et les paramètres d'envoi.",
  },
  {
    pattern: /reminder|relance/i,
    message:
      "Impossible d'envoyer la relance. Vérifiez l'e-mail du client, le contenu du message et la configuration dans Paramètres → Relances.",
  },
  {
    pattern: /reminders.*disabled|relances.*désactiv|automatic.*disabled/i,
    message:
      "Les relances automatiques sont désactivées. Activez-les dans Paramètres → Relances.",
  },
  {
    pattern: /already reminded|déjà relanc|too soon|trop récent/i,
    message:
      "Une relance a déjà été envoyée récemment pour cette facture. Patientez avant un nouvel envoi.",
  },
  {
    pattern: /invoice.*(paid|settled)|facture.*(payée|soldée)/i,
    message:
      "Cette facture est déjà payée ou soldée. Aucune relance n'est nécessaire.",
  },
  {
    pattern: /level.*(invalid|must)|niveau.*invalide/i,
    message: "Le niveau de relance sélectionné n'est pas valide.",
  },
  {
    pattern: /sms.*(not configured|unavailable)|sms.*indisponible/i,
    message:
      "L'envoi par SMS n'est pas configuré. Utilisez l'e-mail ou contactez un administrateur.",
  },
  {
    pattern: /pdf.*(fail|error|generat)|génération.*pdf/i,
    message:
      "La génération du PDF a échoué. Vérifiez le modèle PDF dans les paramètres.",
  },
  {
    pattern:
      /imputation|allocation|amount.*exceed|dépasse|montant.*(supérieur|trop)|exceeds.*due/i,
    message:
      "Le montant imputé est invalide. Vérifiez les montants par facture et le total reçu.",
  },
  {
    pattern: /already cancelled|déjà annulé|payment.*cancelled/i,
    message: "Cet encaissement est déjà annulé.",
  },
  {
    pattern: /cannot cancel|can not cancel|impossible.*annul/i,
    message:
      "Cet encaissement ne peut pas être annulé. Vérifiez son statut et les imputations liées.",
  },
  {
    pattern: /no open invoice|aucune facture|facture.*ouverte/i,
    message:
      "Aucune facture ouverte ne correspond à cet encaissement pour ce client.",
  },
  {
    pattern: /payment.*(not found|invalid)|encaissement.*introuvable/i,
    message: "Encaissement introuvable. Actualisez la page et réessayez.",
  },
  {
    pattern: /role already exists|code already exists|duplicate.*code|code.*already/i,
    message: "Ce code de rôle est déjà utilisé pour cette organisation.",
  },
  {
    pattern: /cannot delete.*role|role.*assigned|role.*in use|users?.*assigned.*role|supprimer.*rôle/i,
    message:
      "Ce rôle ne peut pas être supprimé car il est encore assigné à des utilisateurs.",
  },
  {
    pattern: /permission.*(not found|invalid)|permissions?.*introuvable/i,
    message: "Une ou plusieurs permissions sélectionnées ne sont pas valides.",
  },
  {
    pattern: /role.*(not found|introuvable)/i,
    message: "Rôle introuvable. Actualisez la page et réessayez.",
  },
  {
    pattern: /user already exists|email.*(already|exist|duplicate|taken|utilisé)|adresse.*déjà/i,
    message:
      "Cette adresse e-mail est déjà utilisée par un autre compte.",
  },
  {
    pattern: /user.*(not found|introuvable)|utilisateur.*introuvable/i,
    message: "Utilisateur introuvable. Actualisez la page et réessayez.",
  },
  {
    pattern: /cannot.*(delete|remove).*self|supprimer.*(soi|votre)|own account/i,
    message: "Vous ne pouvez pas supprimer ou désactiver votre propre compte.",
  },
  {
    pattern: /last admin|dernier administrateur|only admin/i,
    message:
      "Impossible de retirer le dernier administrateur de l'organisation.",
  },
  {
    pattern: /role.*(invalid|not found)|rôle.*(invalide|introuvable)/i,
    message: "Un ou plusieurs rôles sélectionnés ne sont pas valides.",
  },
  {
    pattern: /password.*(weak|too short|invalid)|mot de passe.*(faible|court|invalide)/i,
    message:
      "Le mot de passe ne respecte pas les critères de sécurité (8 caractères minimum).",
  },
  {
    pattern: /inactive|désactivé|disabled.*user/i,
    message: "Ce compte utilisateur est désactivé.",
  },
  {
    pattern: /validation failed|bad request/i,
    message: "Certaines informations saisies sont invalides. Vérifiez les champs en rouge.",
  },
  {
    pattern: /conflict/i,
    message: "Ces informations entrent en conflit avec un compte existant.",
  },
  {
    pattern: /tenant.*limit|maximum.*users|user limit|too many users/i,
    message: "Le nombre maximal d'utilisateurs autorisés est atteint.",
  },
  {
    pattern: /must be an email|invalid email address/i,
    message: "Adresse e-mail invalide — utilisez un format valide (ex. nom@domaine.fr).",
  },
  {
    pattern: /firstName.*(short|long|length|characters)|first name/i,
    message: "Le prénom doit contenir au moins 2 caractères.",
  },
  {
    pattern: /lastName.*(short|long|length|characters)|last name/i,
    message: "Le nom doit contenir au moins 2 caractères.",
  },
  {
    pattern:
      /tax.?rate.*(in use|used|referenced)|taux.*tva.*(utilisé|supprim)|cannot delete.*tax/i,
    message:
      "Ce taux de TVA est utilisé sur des documents et ne peut pas être supprimé.",
  },
  {
    pattern: /default tax|taux.*défaut|only one default.*tax/i,
    message:
      "Un seul taux de TVA peut être défini par défaut. Désactivez l'autre taux par défaut d'abord.",
  },
  {
    pattern:
      /primary currency|devise principale|cannot delete.*currency|currency.*in use/i,
    message:
      "Cette devise ne peut pas être supprimée (devise principale ou encore utilisée).",
  },
  {
    pattern:
      /payment.?term.*(in use|used|referenced)|condition.*paiement.*(utilisée|supprim)/i,
    message:
      "Cette condition de paiement est utilisée sur des documents et ne peut pas être supprimée.",
  },
  {
    pattern: /default payment|condition.*défaut/i,
    message:
      "Une seule condition de paiement peut être définie par défaut.",
  },
  {
    pattern: /numbering|numérotation|counter.*length|invalid.*prefix/i,
    message:
      "Format de numérotation invalide. Vérifiez le préfixe, le séparateur et la longueur du compteur.",
  },
  {
    pattern: /settings.*(not found|forbidden)|paramètres.*(introuvable|interdit)/i,
    message:
      "Paramètres introuvables ou accès refusé. Actualisez la page ou contactez un administrateur.",
  },
  {
    pattern: /invalid.*(color|hex)|couleur.*invalide/i,
    message: "La couleur choisie n'est pas valide.",
  },
  {
    pattern: /logo.*(url|invalid)|url.*logo/i,
    message: "L'URL du logo n'est pas valide ou inaccessible.",
  },
];

const VAGUE_ERROR_PATTERNS = [
  /^une erreur est survenue\.?$/i,
  /^une erreur inattendue est survenue\.?$/i,
  /^bad request\.?$/i,
  /^error\.?$/i,
  /^request failed\.?$/i,
  /^failed\.?$/i,
];

function humanizeBusinessMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return message;

  for (const { pattern, message: text } of BUSINESS_MESSAGE_PATTERNS) {
    if (pattern.test(trimmed)) return text;
  }

  return trimmed;
}

export function isVagueErrorMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return true;
  return VAGUE_ERROR_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function resolveFormErrorMessage(error: unknown): string {
  if (error instanceof ApiValidationError) {
    const message = error.fieldErrors.root ?? error.message;
    return humanizeBusinessMessage(message);
  }

  if (isOfflineError(error)) {
    return "Connexion requise. Vérifiez votre réseau ou réessayez une fois en ligne.";
  }

  if (error instanceof AppError) {
    if (error.statusCode === 403) {
      return "Vous n'avez pas les droits pour effectuer cette action.";
    }
    if (error.statusCode === 404) {
      return "Élément introuvable. Actualisez la page et réessayez.";
    }
    if (error.statusCode >= 500) {
      return "Erreur serveur. Réessayez dans quelques instants.";
    }
    return humanizeBusinessMessage(error.message);
  }

  if (error instanceof Error && error.message) {
    return humanizeBusinessMessage(error.message);
  }

  return "Une erreur inattendue est survenue.";
}
