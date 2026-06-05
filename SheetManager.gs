// ================================================================
// SheetManager.gs - Gestion de la feuille Google Sheets
// ================================================================

function getMainSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME, 0);
    setupSheetHeaders(sheet);
  }
  return sheet;
}

function getSettingsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SETTINGS_SHEET_NAME);
    initSettingsSheet(sheet);
  }
  return sheet;
}

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let main = ss.getSheetByName(SHEET_NAME);
  if (!main) {
    main = ss.insertSheet(SHEET_NAME, 0);
  }
  setupSheetHeaders(main);

  let settings = ss.getSheetByName(SETTINGS_SHEET_NAME);
  if (!settings) {
    settings = ss.insertSheet(SETTINGS_SHEET_NAME);
  }
  initSettingsSheet(settings);
}

function setupSheetHeaders(sheet) {
  const headers = [
    'Sexe', 'Prénom', 'Nom', 'Email', 'Entreprise',
    'Dossier Drive', 'Envoyé le', 'Relance 1', 'Relance 2',
    'Statuts', 'R1 envoyé', 'R2 envoyé', 'Thread ID', 'Date réponse'
  ];

  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1a73e8');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 36);

  const widths = [60, 100, 120, 200, 180, 150, 100, 100, 100, 160, 90, 90, 200, 110];
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));

  sheet.hideColumns(COL.THREAD_ID);
  sheet.setFrozenRows(1);

  const sexeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['M', 'Mme'], true).build();
  sheet.getRange(2, COL.SEXE, 5000, 1).setDataValidation(sexeRule);

  const statutRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(Object.values(STATUS), true).build();
  sheet.getRange(2, COL.STATUT, 5000, 1).setDataValidation(statutRule);

  sheet.getRange(2, COL.ENVOYE_LE,    5000, 1).setNumberFormat('dd/MM/yyyy');
  sheet.getRange(2, COL.RELANCE_1_DATE, 5000, 1).setNumberFormat('dd/MM/yyyy');
  sheet.getRange(2, COL.RELANCE_2_DATE, 5000, 1).setNumberFormat('dd/MM/yyyy');
  sheet.getRange(2, COL.R1_ENVOYE,    5000, 1).setNumberFormat('dd/MM/yyyy');
  sheet.getRange(2, COL.R2_ENVOYE,    5000, 1).setNumberFormat('dd/MM/yyyy');
  sheet.getRange(2, COL.DATE_REPONSE, 5000, 1).setNumberFormat('dd/MM/yyyy');
}

function initSettingsSheet(sheet) {
  const defs = getDefaultTemplates();
  const rows = [
    ['clé', 'valeur'],
    ['relance1_jours',  DEFAULT_DELAYS.relance1Days],
    ['relance2_jours',  DEFAULT_DELAYS.relance2Days],
    ['nom_expediteur',  ''],
    ['mon_telephone',   ''],
    ['ma_photo_url',    ''],
    ['sujet_initial',   defs.initial.subject],
    ['corps_initial',   defs.initial.body],
    ['sujet_relance1',  defs.relance1.subject],
    ['corps_relance1',  defs.relance1.body],
    ['sujet_relance2',  defs.relance2.subject],
    ['corps_relance2',  defs.relance2.body],
    ['signature',       defs.signature],
  ];
  sheet.clearContents();
  sheet.getRange(1, 1, rows.length, 2).setValues(rows);
  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidth(2, 600);
  sheet.hideSheet();
}

// ---- Settings key/value helpers ----

function getSettingValue(key) {
  const data = getSettingsSheet().getDataRange().getValues();
  for (const row of data) {
    if (row[0] === key) return row[1];
  }
  return null;
}

function setSettingValue(key, value) {
  const sheet = getSettingsSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  const last = sheet.getLastRow();
  sheet.getRange(last + 1, 1).setValue(key);
  sheet.getRange(last + 1, 2).setValue(value);
}

function getAllSettings() {
  const defs = getDefaultTemplates();
  return {
    relance1Jours:  parseInt(getSettingValue('relance1_jours'))  || DEFAULT_DELAYS.relance1Days,
    relance2Jours:  parseInt(getSettingValue('relance2_jours'))  || DEFAULT_DELAYS.relance2Days,
    nomExpediteur:  getSettingValue('nom_expediteur') || '',
    monTelephone:   getSettingValue('mon_telephone')  || '',
    maPhotoUrl:     getSettingValue('ma_photo_url')   || '',
    sujetInitial:   getSettingValue('sujet_initial')  || defs.initial.subject,
    corpsInitial:   getSettingValue('corps_initial')  || defs.initial.body,
    sujetRelance1:  getSettingValue('sujet_relance1') || defs.relance1.subject,
    corpsRelance1:  getSettingValue('corps_relance1') || defs.relance1.body,
    sujetRelance2:  getSettingValue('sujet_relance2') || defs.relance2.subject,
    corpsRelance2:  getSettingValue('corps_relance2') || defs.relance2.body,
    signature:      getSettingValue('signature')      || defs.signature,
  };
}

function saveAllSettings(data) {
  const keys = [
    'relance1_jours', 'relance2_jours', 'nom_expediteur', 'mon_telephone', 'ma_photo_url',
    'sujet_initial', 'corps_initial',
    'sujet_relance1', 'corps_relance1',
    'sujet_relance2', 'corps_relance2',
    'signature'
  ];
  const values = [
    data.relance1Jours, data.relance2Jours, data.nomExpediteur, data.monTelephone, data.maPhotoUrl,
    data.sujetInitial, data.corpsInitial,
    data.sujetRelance1, data.corpsRelance1,
    data.sujetRelance2, data.corpsRelance2,
    data.signature
  ];
  keys.forEach((k, i) => setSettingValue(k, values[i]));
  return true;
}

// ---- Row reading ----

function getAllCandidatures() {
  const sheet = getMainSheet();
  const data = sheet.getDataRange().getValues();
  const list = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    const email = (r[COL.EMAIL - 1] || '').toString().trim();
    if (!email) continue;
    list.push({
      rowIndex:      i + 1,
      sexe:          r[COL.SEXE - 1],
      prenom:        r[COL.PRENOM - 1],
      nom:           r[COL.NOM - 1],
      email:         email,
      entreprise:    r[COL.ENTREPRISE - 1],
      dossierDrive:  r[COL.DOSSIER_DRIVE - 1],
      envoyeLe:      r[COL.ENVOYE_LE - 1],
      relance1Date:  r[COL.RELANCE_1_DATE - 1],
      relance2Date:  r[COL.RELANCE_2_DATE - 1],
      statut:        r[COL.STATUT - 1],
      r1Envoye:      r[COL.R1_ENVOYE - 1],
      r2Envoye:      r[COL.R2_ENVOYE - 1],
      threadId:      r[COL.THREAD_ID - 1],
      dateReponse:   r[COL.DATE_REPONSE - 1],
    });
  }
  return list;
}

// ---- Row writing ----

function updateRowAfterInitialSend(rowIndex, threadId) {
  const sheet = getMainSheet();
  const today = new Date();
  const delays = getDelays();

  const r1 = new Date(today); r1.setDate(r1.getDate() + delays.relance1Days);
  const r2 = new Date(today); r2.setDate(r2.getDate() + delays.relance2Days);

  sheet.getRange(rowIndex, COL.ENVOYE_LE).setValue(today);
  sheet.getRange(rowIndex, COL.RELANCE_1_DATE).setValue(r1);
  sheet.getRange(rowIndex, COL.RELANCE_2_DATE).setValue(r2);
  sheet.getRange(rowIndex, COL.STATUT).setValue(STATUS.ENVOYE);
  sheet.getRange(rowIndex, COL.THREAD_ID).setValue(threadId || '');
  applyStatusColor(sheet, rowIndex, STATUS.ENVOYE);
}

function updateRowAfterRelance(rowIndex, relanceNum) {
  const sheet = getMainSheet();
  const today = new Date();
  const newStatus = relanceNum === 1 ? STATUS.R1_ENVOYE : STATUS.R2_ENVOYE;
  const col = relanceNum === 1 ? COL.R1_ENVOYE : COL.R2_ENVOYE;
  sheet.getRange(rowIndex, col).setValue(today);
  sheet.getRange(rowIndex, COL.STATUT).setValue(newStatus);
  applyStatusColor(sheet, rowIndex, newStatus);
}

function updateRowReplyDetected(rowIndex) {
  const sheet = getMainSheet();
  sheet.getRange(rowIndex, COL.STATUT).setValue(STATUS.REPONSE);
  sheet.getRange(rowIndex, COL.DATE_REPONSE).setValue(new Date());
  applyStatusColor(sheet, rowIndex, STATUS.REPONSE);
}

function applyStatusColor(sheet, rowIndex, status) {
  const color = STATUS_COLORS[status] || '#ffffff';
  sheet.getRange(rowIndex, 1, 1, 12).setBackground(color);
}

// ---- Stats ----

function getDelays() {
  return {
    relance1Days: parseInt(getSettingValue('relance1_jours')) || DEFAULT_DELAYS.relance1Days,
    relance2Days: parseInt(getSettingValue('relance2_jours')) || DEFAULT_DELAYS.relance2Days,
  };
}

function getStats() {
  const candidatures = getAllCandidatures();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const stats = {
    total: candidatures.length,
    aEnvoyer: 0, envoye: 0, r1Envoye: 0, r2Envoye: 0,
    reponseRecue: 0, refus: 0, entretien: 0, accepte: 0,
    relancesDuJour: 0,
  };
  candidatures.forEach(c => {
    switch (c.statut) {
      case STATUS.A_ENVOYER: stats.aEnvoyer++;    break;
      case STATUS.ENVOYE:    stats.envoye++;      break;
      case STATUS.R1_ENVOYE: stats.r1Envoye++;    break;
      case STATUS.R2_ENVOYE: stats.r2Envoye++;    break;
      case STATUS.REPONSE:   stats.reponseRecue++; break;
      case STATUS.REFUS:     stats.refus++;        break;
      case STATUS.ENTRETIEN: stats.entretien++;    break;
      case STATUS.ACCEPTE:   stats.accepte++;      break;
    }
    if (c.statut === STATUS.ENVOYE && c.relance1Date) {
      const d = new Date(c.relance1Date); d.setHours(0,0,0,0);
      if (d <= today) stats.relancesDuJour++;
    }
    if (c.statut === STATUS.R1_ENVOYE && c.relance2Date) {
      const d = new Date(c.relance2Date); d.setHours(0,0,0,0);
      if (d <= today) stats.relancesDuJour++;
    }
  });
  return stats;
}

function getUpcomingActions() {
  const candidatures = getAllCandidatures();
  const today = new Date(); today.setHours(0,0,0,0);
  const in7 = new Date(today); in7.setDate(in7.getDate() + 7);
  const actions = [];

  candidatures.forEach(c => {
    if (c.statut === STATUS.ENVOYE && c.relance1Date) {
      const d = new Date(c.relance1Date); d.setHours(0,0,0,0);
      if (d <= in7) actions.push({ date: d.toISOString(), type: 'Relance 1', nom: `${c.prenom} ${c.nom}`, entreprise: c.entreprise, rowIndex: c.rowIndex, overdue: d < today });
    }
    if (c.statut === STATUS.R1_ENVOYE && c.relance2Date) {
      const d = new Date(c.relance2Date); d.setHours(0,0,0,0);
      if (d <= in7) actions.push({ date: d.toISOString(), type: 'Relance 2', nom: `${c.prenom} ${c.nom}`, entreprise: c.entreprise, rowIndex: c.rowIndex, overdue: d < today });
    }
  });

  actions.sort((a, b) => new Date(a.date) - new Date(b.date));
  return actions;
}
