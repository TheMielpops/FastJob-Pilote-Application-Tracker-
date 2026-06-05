// ================================================================
// Config.gs - Constantes et configuration globale
// ================================================================

const COL = {
  SEXE: 1,
  PRENOM: 2,
  NOM: 3,
  EMAIL: 4,
  ENTREPRISE: 5,
  DOSSIER_DRIVE: 6,
  ENVOYE_LE: 7,
  RELANCE_1_DATE: 8,
  RELANCE_2_DATE: 9,
  STATUT: 10,
  R1_ENVOYE: 11,
  R2_ENVOYE: 12,
  THREAD_ID: 13,
  DATE_REPONSE: 14
};

const SHEET_NAME = 'Candidatures';
const SETTINGS_SHEET_NAME = 'Paramètres';

const STATUS = {
  A_ENVOYER: 'À envoyer',
  ENVOYE: 'Envoyé',
  R1_ENVOYE: 'Relance 1 envoyée',
  R2_ENVOYE: 'Relance 2 envoyée',
  REPONSE: 'Réponse reçue',
  REFUS: 'Refus',
  ENTRETIEN: 'Entretien planifié',
  ACCEPTE: 'Accepté'
};

const STATUS_COLORS = {
  'À envoyer':          '#f8f9fa',
  'Envoyé':             '#cfe2ff',
  'Relance 1 envoyée':  '#fff3cd',
  'Relance 2 envoyée':  '#ffe5d0',
  'Réponse reçue':      '#d1e7dd',
  'Refus':              '#f8d7da',
  'Entretien planifié': '#e2d9f3',
  'Accepté':            '#b8daff'
};

const DEFAULT_DELAYS = {
  relance1Days: 7,
  relance2Days: 14
};

function getDefaultTemplates() {
  return {
    initial: {
      subject: 'Candidature alternance – {entreprise}',
      body: `<p>Bonjour {civilité} {nom},</p>

<p>Je me permets de vous contacter afin de vous soumettre ma candidature pour un poste en alternance au sein de <strong>{entreprise}</strong>.</p>

<p>Très motivé(e) par votre domaine d'activité, je serais ravi(e) de pouvoir contribuer à votre équipe et mettre mes compétences à votre service.</p>

<p>Je reste disponible pour tout entretien à votre convenance et vous adresse mon CV en pièce jointe.</p>

<p>Dans l'attente de votre retour, je vous adresse mes cordiales salutations.</p>`
    },
    relance1: {
      subject: 'Relance – Candidature alternance – {entreprise}',
      body: `<p>Bonjour {civilité} {nom},</p>

<p>Je me permets de revenir vers vous concernant ma candidature pour un poste en alternance chez <strong>{entreprise}</strong>, que je vous ai adressée le <strong>{date_envoi}</strong>.</p>

<p>Toujours très motivé(e) par cette opportunité, je souhaitais m'assurer que vous avez bien reçu mon dossier et reste disponible pour toute question ou entretien selon vos disponibilités.</p>

<p>Cordialement,</p>`
    },
    relance2: {
      subject: 'Deuxième relance – Candidature alternance – {entreprise}',
      body: `<p>Bonjour {civilité} {nom},</p>

<p>Je me permets de vous contacter une dernière fois au sujet de ma candidature chez <strong>{entreprise}</strong>.</p>

<p>Je comprends que vous êtes certainement très sollicité(e). Si ce poste n'est plus disponible, n'hésitez pas à conserver mon profil pour de futures opportunités en alternance.</p>

<p>Je reste à votre disposition pour tout échange.</p>

<p>Cordialement,</p>`
    },
    signature: `<br>
<table style="font-family:Arial,sans-serif;font-size:13px;color:#333;border-collapse:collapse;">
  <tr>
    <td style="padding-right:14px;vertical-align:middle;">
      <img src="{ma_photo}" alt="{mon_prenom} {mon_nom}"
           width="72" height="72"
           style="border-radius:50%;object-fit:cover;display:block;border:2px solid #1a73e8;">
    </td>
    <td style="padding-left:14px;border-left:3px solid #1a73e8;vertical-align:top;padding-right:20px;">
      <strong style="font-size:15px;color:#1a1a1a;">{mon_prenom} {mon_nom}</strong><br>
      <span style="color:#555;font-size:12px;">Étudiant(e) en recherche d'alternance</span><br><br>
      <span style="color:#1a73e8;">✉ {mon_email}</span><br>
      <span style="color:#555;">📱 {mon_tel}</span>
    </td>
  </tr>
</table>`
  };
}
