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
      {}),
  'display_withdrawal_donation': true
};

// Addresses for donations via withdrawals.
var DONATION_CONFIG = {
  'BTC': {'address': '15gdw8khnhEvVEEjbSR8aXSPvbwNdCUEPJ',
          'amount': '0.002'},
  'DASH': {'address': 'XawQPh2Cy38iLXFvg3jYwDg4DHDucZVNpX',
           'amount': '0.04'},
  'ETH': {'address': '0x97b803032096a250079e6f84b4327cd0452c73ec',
          'amount': '0.02'},
  'ETC': {'address': '0x3571b4135b26e25b222dc72156f2cc4a7ff8a7a6',
          'amount': '0.35'},
  'LTC': {'address': 'LPcuzW4VPSYeCFcx32cqJnw3ugbnP8NFp1',
          'amount': '0.2'},
  'ZEC': {'address': 't1ZjicmTjARFdwDQyXG9Aim6ctmhwwaJY3x',
          'amount': '0.015'},
  'GNO': {'address':'0x97b803032096a250079e6f84b4327cd0452c73ec',
          'amount': '0.025'},
  'GNT': {'address': '0x97b803032096a250079e6f84b4327cd0452c73ec',
          'amount': '11.0'},
  'REP': {'address': '0x97b803032096a250079e6f84b4327cd0452c73ec',
          'amount': '0.21'},
};

// Current settings.
var SETTINGS = jQuery.extend(true, {}, DEFAULT_SETTINGS);

// Merges current global in-memory settings with new settings.
function mergeSettings(settings) {
  for (var i in settings) {
    if ((typeof settings[i]) == "object") {
      for (var j in settings[i]) {
        SETTINGS[i][j] = settings[i][j];
      }
    } else {
      SETTINGS[i] = settings[i];
    }
  }
}

// Loads all settings and passes them to the callback.
function loadSettings(callback) {
  chrome.storage.sync.get('settings', function(r) {
    // Update all in-memory settings from storage.
    try {
      mergeSettings(r.settings);
    } catch (ex) {
      resetSettings();
    }
    if (callback) {
      callback(SETTINGS);
    }
  });
}

// Updates the extension settings in chrome sync storage.
function saveSettings(callback) {
  // Get a value saved in a form.
  // Save it using the Chrome extension storage API.
  chrome.storage.sync.set({'settings': SETTINGS}, function() {
    console.info("PoloNinja: Settings saved.");
    if (callback) {
      callback(SETTINGS);
    }
  });
}

// Updates current settings via updateCallback and saves them.
function updateSettings(updateCallback, saveCallback) {
  updateCallback(SETTINGS);
  saveSettings(saveCallback);
}

// Attaches a listener for settings changes.
function onSettingsChanged(callback) {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if ("settings" in changes) {
      mergeSettings(changes["settings"].newValue);
      callback(SETTINGS);
    }
  });
}

// Resets all settings to defaults.
function resetSettings(callback) {
  mergeSettings(DEFAULT_SETTINGS);
  saveSettings(callback);
}
