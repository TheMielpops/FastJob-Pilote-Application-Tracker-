// ================================================================
// Code.gs - Point d'entrée, menu, et fonctions appelables depuis
//           le tableau de bord (sidebar) et les dialogues
// ================================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📧 Alternance Tracker')
    .addItem('📊 Tableau de bord',                    'showDashboard')
    .addSeparator()
    .addItem('📤 Envoyer les candidatures en attente', 'menuSendPending')
    .addItem('🔄 Lancer les relances du jour',         'menuSendFollowUps')
    .addSeparator()
    .addItem('✉️ Vérifier les réponses manuellement',  'menuCheckReplies')
    .addSeparator()
    .addItem('⚙️ Paramètres & Modèles',               'showSettings')
    .addItem('🔧 Configurer l\'automatisation',        'menuSetupAutomation')
    .addSeparator()
    .addItem('📋 Initialiser / Réinitialiser la feuille', 'menuInitSheet')
    .addToUi();
}

// ---- Menu handlers (show alerts) ----

function menuSendPending() {
  const n = apiSendPending();
  SpreadsheetApp.getUi().alert(`✅ ${n} candidature(s) envoyée(s).`);
}

function menuSendFollowUps() {
  const n = apiSendFollowUps();
  SpreadsheetApp.getUi().alert(`✅ ${n} relance(s) envoyée(s).`);
}

function menuCheckReplies() {
  const n = apiCheckReplies();
  SpreadsheetApp.getUi().alert(`✅ ${n} nouvelle(s) réponse(s) détectée(s).`);
}

function menuSetupAutomation() {
  setupDailyTrigger();
  SpreadsheetApp.getUi().alert('✅ Automatisation configurée ! Vérification chaque jour à 9h.');
}

function menuInitSheet() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    'Initialiser la feuille',
    'Cela va créer (ou reformater) les onglets "Candidatures" et "Paramètres". Continuer ?',
    ui.ButtonSet.YES_NO
  );
  if (result === ui.Button.YES) {
    setupSheet();
    ui.alert('✅ Feuille initialisée.');
  }
}

// ---- Sidebar / dialog openers ----

function showDashboard() {
  const html = HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('📊 Alternance Tracker')
    .setWidth(420);
  SpreadsheetApp.getUi().showSidebar(html);
}

function showSettings() {
  const html = HtmlService.createHtmlOutputFromFile('SettingsPanel')
    .setWidth(740)
    .setHeight(640);
  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Paramètres & Modèles');
}

// ---- API functions called from HTML via google.script.run ----
// These return values instead of showing alerts.

function apiSendPending() {
  const candidates = getAllCandidatures();
  let count = 0;
  candidates.forEach(c => {
    if (!c.statut || c.statut === STATUS.A_ENVOYER) {
      try {
        sendInitialEmail(c.rowIndex);
        count++;
        Utilities.sleep(1000);
      } catch (e) {
        Logger.log(`apiSendPending error row ${c.rowIndex}: ${e.message}`);
      }
    }
  });
  return count;
}

function apiSendFollowUps() {
  return processDueFollowUps();
}

function apiCheckReplies() {
  return checkReplies();
}

function apiSetupAutomation() {
  setupDailyTrigger();
  return getTriggerStatus();
}

function apiGetDashboardData() {
  return {
    stats:    getStats(),
    upcoming: getUpcomingActions(),
    trigger:  getTriggerStatus(),
  };
}

// ---- Triggered automatically each day ----

function runDailyAutomation() {
  checkReplies();
  processDueFollowUps();
}
