// The extra column descriptors.
var EXTRA_BALANCE_COLUMNS = [
  {'key': 'avg_buy_price',
   'title': 'AVG Buy Price',
   'setting': 'AVG Buy Price',
   'description': 'Average buy price of the coin based on your trades',
   'default_visibility': true},
  {'key': 'avg_buy_value',
   'title': 'EST Buy Value',
   'setting': 'EST Buy Value',
   'description': 'Estimated coin value at the average buy price',
   'default_visibility': true},
  {'key': 'change_percent',
   'title': 'Change',
   'setting': 'Change since bought',
   'description': 'Growth rate (change since bought)',
   'default_visibility': true},
  {'key': 'usd_value',
   'title': 'USD Value',
   'setting': 'USD Value',
   'description': 'Estimated USD value of your coin holdings',
   'default_visibility': true},
  {'key': 'earnings_sls_btc',
   'title': 'Earnings *',
   'setting': 'Total earnings at last sale (BTC)',
   'description': 'Total estimated earnings in BTC (last purchases excluded)',
   'default_visibility': true},
  {'key': 'earnings_sls_usd',
   'title': 'USD Earn. *',
   'setting': 'Total earnings at last sale (USD)',
   'description': 'Total estimated earnings in USD (last purchases excluded)',
   'default_visibility': true},
];

// Defaults for all settings.
var DEFAULT_SETTINGS = {
  'balance_column_visibility': EXTRA_BALANCE_COLUMNS.reduce(
      (map, col) => { map[col.key] = col.default_visibility; return map; },
      {})
};

// Current settings.
var SETTINGS = jQuery.extend(true, {}, DEFAULT_SETTINGS);

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
    // Update all in-memory settings from storage.
    try {
      for (var i in r.settings) {
        for (var j in r.settings[i]) {
          SETTINGS[i][j] = r.settings[i][j];
        }
      }
    } catch (ex) {
      resetSettings();
    }
    if (callback) {
      callback(SETTINGS);
    }
  });
}

// Resets all settings to defaults.
function resetSettings(callback) {
  SETTINGS = jQuery.extend(true, {}, DEFAULT_SETTINGS);
  updateSettings(callback);
}

// Load up initial settings.
getAllSettings();
