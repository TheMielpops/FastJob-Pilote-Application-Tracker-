// ================================================================
// EmailManager.gs - Envoi d'emails et détection des réponses
// ================================================================

function getTemplate(type) {
  const defs = getDefaultTemplates();
  return {
    subject: getSettingValue(`sujet_${type}`) || defs[type].subject,
    body:    getSettingValue(`corps_${type}`) || defs[type].body,
  };
}

function getSignature() {
  return getSettingValue('signature') || getDefaultTemplates().signature;
}

function personalizeContent(content, c) {
  const sexe = (c.sexe || 'M').toString().trim();
  const isMme = sexe === 'Mme';
  const civilite      = isMme ? 'Madame'   : 'Monsieur';
  const civiliteCourt = isMme ? 'Mme'      : 'M.';

  let dateEnvoiStr = '';
  if (c.envoyeLe) {
    const d = new Date(c.envoyeLe);
    dateEnvoiStr = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
  }

  const nomExp    = (getSettingValue('nom_expediteur') || '').toString();
  const parts     = nomExp.trim().split(/\s+/);
  const monPrenom = parts[0] || '';
  const monNom    = parts.slice(1).join(' ') || '';

  const vars = {
    '{sexe}':           sexe,
    '{civilité}':       civilite,
    '{civilite}':       civilite,
    '{civilité_court}': civiliteCourt,
    '{civilite_court}': civiliteCourt,
    '{prénom}':         (c.prenom  || '').toString(),
    '{prenom}':         (c.prenom  || '').toString(),
    '{nom}':            (c.nom     || '').toString(),
    '{email}':          (c.email   || '').toString(),
    '{entreprise}':     (c.entreprise || '').toString(),
    '{dossier_drive}':  (c.dossierDrive || '').toString(),
    '{date_envoi}':     dateEnvoiStr,
    '{mon_prenom}':     monPrenom,
    '{mon_nom}':        monNom,
    '{mon_email}':      Session.getActiveUser().getEmail(),
    '{mon_tel}':        (getSettingValue('mon_telephone') || '').toString(),
    '{ma_photo}':       (getSettingValue('ma_photo_url')  || '').toString(),
  };

  let result = content;
  for (const [k, v] of Object.entries(vars)) {
    result = result.split(k).join(v);
  }
  return result;
}

function pad(n) { return n.toString().padStart(2, '0'); }

// ---- Send initial email ----

function sendInitialEmail(rowIndex) {
  const sheet = getMainSheet();
  const r = sheet.getRange(rowIndex, 1, 1, 14).getValues()[0];

  const c = {
    sexe: r[COL.SEXE - 1], prenom: r[COL.PRENOM - 1], nom: r[COL.NOM - 1],
    email: (r[COL.EMAIL - 1] || '').toString().trim(),
    entreprise: r[COL.ENTREPRISE - 1], dossierDrive: r[COL.DOSSIER_DRIVE - 1],
    envoyeLe: null,
  };

  if (!c.email) throw new Error('Adresse email manquante à la ligne ' + rowIndex);

  const tpl       = getTemplate('initial');
  const signature = getSignature();
  const subject   = personalizeContent(tpl.subject, c);
  const htmlBody  = personalizeContent(tpl.body + signature, c);
  const nomExp    = (getSettingValue('nom_expediteur') || '').toString();

  const opts = { htmlBody };
  if (nomExp) opts.name = nomExp;

  // --- NOUVEAU CODE PIÈCES JOINTES MULTIPLES ---
  const piecesJointes = getDriveAttachments(c.dossierDrive);
  if (piecesJointes.length > 0) {
    opts.attachments = piecesJointes;
  }
  // ---------------------------------------------

  GmailApp.sendEmail(c.email, subject, '', opts);

  // Retrieve thread ID from sent box
  Utilities.sleep(2500);
  const safeSubject = subject.substring(0, 40).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const threads = GmailApp.search(`to:(${c.email}) in:sent`, 0, 5);
  let threadId = '';
  if (threads.length > 0) threadId = threads[0].getId();

  updateRowAfterInitialSend(rowIndex, threadId);
  Logger.log(`[ENVOI] ${c.prenom} ${c.nom} <${c.email}> – ${c.entreprise}`);
}

// ---- Send follow-up email ----

function sendRelanceEmail(rowIndex, relanceNum) {
  const sheet = getMainSheet();
  const r = sheet.getRange(rowIndex, 1, 1, 14).getValues()[0];

  const c = {
    sexe: r[COL.SEXE - 1], prenom: r[COL.PRENOM - 1], nom: r[COL.NOM - 1],
    email: (r[COL.EMAIL - 1] || '').toString().trim(),
    entreprise: r[COL.ENTREPRISE - 1], dossierDrive: r[COL.DOSSIER_DRIVE - 1],
    envoyeLe: r[COL.ENVOYE_LE - 1],
    threadId: (r[COL.THREAD_ID - 1] || '').toString().trim(),
  };

  if (!c.email) throw new Error('Adresse email manquante à la ligne ' + rowIndex);

  const tpl       = getTemplate(`relance${relanceNum}`);
  const signature = getSignature();
  const subject   = personalizeContent(tpl.subject, c);
  const htmlBody  = personalizeContent(tpl.body + signature, c);
  const nomExp    = (getSettingValue('nom_expediteur') || '').toString();

  const opts = { htmlBody, subject };
  if (nomExp) opts.name = nomExp;

  // --- NOUVEAU CODE PIÈCES JOINTES MULTIPLES ---
  const piecesJointes = getDriveAttachments(c.dossierDrive);
  if (piecesJointes.length > 0) {
    opts.attachments = piecesJointes;
  }
  // ---------------------------------------------

  // Reply in the same thread when possible
  if (c.threadId) {
    try {
      const thread = GmailApp.getThreadById(c.threadId);
      if (thread) {
        thread.reply('', opts);
        updateRowAfterRelance(rowIndex, relanceNum);
        Logger.log(`[RELANCE ${relanceNum}] ${c.prenom} ${c.nom} – ${c.entreprise} (thread reply)`);
        return;
      }
    } catch (e) {
      Logger.log(`Thread reply failed: ${e.message} — falling back to new email`);
    }
  }

  GmailApp.sendEmail(c.email, subject, '', opts);
  updateRowAfterRelance(rowIndex, relanceNum);
  Logger.log(`[RELANCE ${relanceNum}] ${c.prenom} ${c.nom} – ${c.entreprise}`);
}

// ---- Reply detection ----

function checkReplies() {
  const candidatures = getAllCandidatures();
  const terminalStatuses = [STATUS.REPONSE, STATUS.REFUS, STATUS.ENTRETIEN, STATUS.ACCEPTE];
  const myEmail = Session.getActiveUser().getEmail().toLowerCase();
  let count = 0;

  candidatures.forEach(c => {
    if (!c.threadId) return;
    if (terminalStatuses.includes(c.statut)) return;

    try {
      const thread = GmailApp.getThreadById(c.threadId);
      if (!thread) return;

      const messages = thread.getMessages();
      if (messages.length <= 1) return;

      // A reply exists if any message was NOT sent by us
      const hasReply = messages.some(msg => {
        const from = msg.getFrom().toLowerCase();
        return !from.includes(myEmail);
      });

      if (hasReply) {
        updateRowReplyDetected(c.rowIndex);
        count++;
        Logger.log(`[RÉPONSE] ${c.prenom} ${c.nom} – ${c.entreprise}`);
      }
    } catch (e) {
      Logger.log(`checkReplies error row ${c.rowIndex}: ${e.message}`);
    }
  });

  return count;
}

// ---- Process due follow-ups ----

function processDueFollowUps() {
  const candidatures = getAllCandidatures();
  const now = new Date(); now.setHours(23, 59, 59, 0);
  let count = 0;

  candidatures.forEach(c => {
    try {
      if (c.statut === STATUS.ENVOYE && c.relance1Date) {
        if (new Date(c.relance1Date) <= now) {
          sendRelanceEmail(c.rowIndex, 1);
          count++;
          Utilities.sleep(1500);
        }
      }
      if (c.statut === STATUS.R1_ENVOYE && c.relance2Date) {
        if (new Date(c.relance2Date) <= now) {
          sendRelanceEmail(c.rowIndex, 2);
          count++;
          Utilities.sleep(1500);
        }
      }
    } catch (e) {
      Logger.log(`processDueFollowUps error row ${c.rowIndex}: ${e.message}`);
    }
  });

  return count;
}

// ---- Preview helper (called from SettingsPanel) ----

function previewEmail(type, sampleData) {
  const tpl = getTemplate(type);
  const sig = getSignature();
  const c = {
    sexe: sampleData.sexe || 'M',
    prenom: sampleData.prenom || 'Marie',
    nom: sampleData.nom || 'Dupont',
    email: sampleData.email || 'contact@exemple.fr',
    entreprise: sampleData.entreprise || 'Exemple SARL',
    envoyeLe: new Date(),
    dossierDrive: '',
  };
  return {
    subject: personalizeContent(tpl.subject, c),
    body:    personalizeContent(tpl.body + sig, c),
  };
}

// ---- File attachments helper ----

function getDriveAttachments(urls) {
  if (!urls) return [];
  
  // Sépare les liens s'il y en a plusieurs (par espace ou saut de ligne)
  const liens = urls.toString().split(/[\s,\n]+/);
  const pieces = [];

  liens.forEach(url => {
    if (!url.trim()) return; 
    
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      try {
        pieces.push(DriveApp.getFileById(match[1]).getBlob());
      } catch(e) {
        Logger.log("Erreur pièce jointe pour l'ID " + match[1] + " : " + e.message);
      }
    }
  });
  
  return pieces;
}
