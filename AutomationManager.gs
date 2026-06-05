// ================================================================
// AutomationManager.gs - Déclencheurs et automatisation
// ================================================================

function setupDailyTrigger() {
  deleteTriggers();
  ScriptApp.newTrigger('runDailyAutomation')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
  Logger.log('Déclencheur quotidien configuré à 9h.');
}

function deleteTriggers() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'runDailyAutomation')
    .forEach(t => ScriptApp.deleteTrigger(t));
}

function getTriggerStatus() {
  const active = ScriptApp.getProjectTriggers()
    .some(t => t.getHandlerFunction() === 'runDailyAutomation');
  return {
    active,
    description: active
      ? 'Automatisation active – vérification quotidienne à 9h'
      : 'Automatisation inactive',
  };
}
