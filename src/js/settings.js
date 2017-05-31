// Defaults for all settings.
var DEFAULT_SETTINGS = {
  'balance_column_visibility': {
    "avg_buy_price": true,
    "avg_buy_value": true,
    "change_percent": true,
    "usd_value": true,
  }
}

// Current settings.
var SETTINGS = jQuery.extend(true, {}, DEFAULT_SETTINGS);

var SETTINGS_READY = false;

// Updates the extension settings in chrome sync storage.
function updateSettings(callback) {
  // Get a value saved in a form.
  // Save it using the Chrome extension storage API.
  chrome.storage.sync.set({'settings': SETTINGS}, function() {
    if (callback) {
      callback(SETTINGS);
    }
  });
}

// Loads the current settings and provides the inner setting with provided key
// to the callback.
function getSettings(key, callback) {
  chrome.storage.sync.get('settings', function(r) {
    callback(r.settings[key]);
  });
}

// Loads all settings and passes them to the callback.
function getAllSettings(callback) {
  chrome.storage.sync.get('settings', function(r) {
    callback(r.settings);
  });
}

// Resets all settings to defaults.
function resetSettings(callback) {
  SETTINGS = jQuery.extend(true, {}, DEFAULT_SETTINGS);
  updateSettings(callback);
}

// Load the current settings.
chrome.storage.sync.get('settings', function(r) {
  // Update all settings.
  try {
    for (var i in r.settings) {
      for (var j in r.settings[i]) {
        SETTINGS[i][j] = r.settings[i][j];
      }
    }
  } catch (ex) {
    resetSettings();
  }
});
