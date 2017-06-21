// The extra column descriptors.
var EXTRA_BALANCE_COLUMNS = [
  {'key': 'last_btc_price',
   'title': 'BTC Price',
   'setting': 'Last price (BTC)',
   'description': 'Last price of the coin in BTC (real-time sync)',
   'class': 'bg-neutral',
   'default_visibility': true},
  {'key': 'last_usdt_price',
   'title': 'USDT Price',
   'setting': 'Last price (USDT)',
   'description': 'Last price of the coin in USDT (real-time sync)',
   'class': 'bg-neutral',
   'default_visibility': true},
  {'key': 'avg_buy_price',
   'title': 'AVG Buy Price',
   'setting': 'AVG Buy Price',
   'description': 'Average buy price of the coin based on your trades',
   'class': '',
   'default_visibility': true},
  {'key': 'avg_buy_value',
   'title': 'EST Buy Value',
   'setting': 'EST Buy Value',
   'description': 'Estimated coin value at the average buy price',
   'class': '',
   'default_visibility': true},
  {'key': 'change_percent',
   'title': 'Change',
   'setting': 'Change since bought',
   'description': 'Growth rate (change since bought)',
   'class': '',
   'default_visibility': true},
  {'key': 'usd_value',
   'title': 'USD Value',
   'setting': 'USD Value',
   'description': 'Estimated USD value of your coin holdings',
   'class': 'bg-neutral',
   'default_visibility': true},
  {'key': 'earnings_sls_btc',
   'title': 'Earnings *',
   'setting': 'Total earnings at last sale (BTC)',
   'description': 'Total estimated earnings in BTC (last purchases excluded)',
   'class': '',
   'default_visibility': true},
  {'key': 'earnings_sls_usd',
   'title': 'USD Earn. *',
   'setting': 'Total earnings at last sale (USD)',
   'description': 'Total estimated earnings in USD (last purchases excluded)',
   'class': '',
   'default_visibility': true},
];

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

// Defaults for all settings.
var DEFAULT_SETTINGS = {
  'balance_column_visibility': EXTRA_BALANCE_COLUMNS.reduce(
      (map, col) => { map[col.key] = col.default_visibility; return map; },
      {}),
  'display_withdrawal_donation': true,
  'balance_row_filters': {
    'hide_untraded': false
  },
  'real_time_updates': {
    'ticker': true
  }
};

// The context menu options and links.
var CONTEXT_MENU = [
  {'type': 'normal',
   'key': 'balance_column_visibility',
   'title': 'Extra columns',
   'children': EXTRA_BALANCE_COLUMNS.map(
          function (col) {
            return {'type': 'checkbox',
                    'key': col.key,
                    'title': col.title,
                    'path': 'balance_column_visibility.' + col.key}
          })},
  {'type': 'checkbox',
   'key': 'real_time_ticker',
   'title': 'Real-time ticker',
   'path': 'real_time_updates.ticker'},
  {'type': 'separator'},
  {'type': 'normal',
   'key': 'donate',
   'title': 'Buy me a coffee (or beer)',
   'url': 'http://bit.ly/polo-ninja-coffee'},
  {'type': 'separator'},
  {'type': 'normal',
   'key': 'rate_extension',
   'title': 'Rate extension',
   'url': 'http://bit.ly/polo-ninja'},
  {'type': 'normal',
   'key': 'send_feedback',
   'title': 'Send feedback',
   'url': 'https://github.com/codesonzh/poloniex-ninja/issues/new'},
  {'type': 'normal',
   'key': 'follow_on_twitter',
   'title': 'Follow me on Twitter',
   'url': 'https://twitter.com/codesonzh'},
  {'type': 'normal',
   'key': 'view_source_code',
   'title': 'View source on Github',
   'url': 'https://github.com/codesonzh/poloniex-ninja'},
];

// List of URLs where to show the context menu.
var CONTEXT_MENU_URL_PATTERNS = [
  "https://www.poloniex.com/*",
  "https://poloniex.com/*"
];

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

// Sets value inside object referenced by dot separated path.
function setByPath(path, value, settings) {
  var parts = path.split('.');
  var endKey = parts.pop();
  var setting = settings || SETTINGS;
  for (var i = 0; i < parts.length; i++) {
    setting = setting[parts[i]];
  }
  setting[endKey] = value;
}

// Returns value from object referenced by dot separated path.
function getByPath(path, settings) {
  var parts = path.split('.');
  var endKey = parts.pop();
  var setting = settings || SETTINGS;
  for (var i = 0; i < parts.length; i++) {
    setting = setting[parts[i]];
  }
  return setting[endKey];
}

// Creates the context menu with settings and links.
function createContextMenu(settings, options, parent) {
  var options = options || CONTEXT_MENU;
  var parent = parent ||
      chrome.contextMenus.create({
        "title": "Poloniex\u2122 Ninja",
        "documentUrlPatterns": CONTEXT_MENU_URL_PATTERNS,
        "contexts": ["page"]
      });
  var settings = settings || SETTINGS;

  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    var menuItemDescriptor = {"parentId": parent,
                              "type": option.type};
    if ("title" in option) {
      menuItemDescriptor.title = option.title;
    }

    if (option.type == "checkbox") {
      menuItemDescriptor.checked = getByPath(option.path, settings);
      menuItemDescriptor.onclick = (function(path) {
        return function(info, tab) {
          updateSettings(function(settings) {
            setByPath(path, info.checked, settings);
          });
        }
      })(option.path);
    } else if (option.type == "normal" && option.url) {
      menuItemDescriptor.onclick = (function(url) {
        return function(info, tab) {
          chrome.tabs.create({url: url});
        }
      })(option.url);
    }

    var menuItem = chrome.contextMenus.create(menuItemDescriptor);
    if ("children" in option) {
      createContextMenu(settings, option.children, menuItem);
    }
  }
}

// Completely removes the context menu . Once complete, invokes the callback.
function removeContextMenu(callback) {
  chrome.contextMenus.removeAll(callback);
}

// Removes and creates the context menu anew.
function recreateContextMenu(settings) {
  console.info("PoloNinja: Recreating context menu.");
  removeContextMenu(function() {
    createContextMenu(settings);
  });
}
