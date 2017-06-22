// from settings.js import EXTRA_BALANCE_COLUMNS, DONATION_CONFIG, SETTINGS,
// loadSettings, saveSettings, onSettingsChanged.
// from websocket.js import WS.setupWebSocket.

(function() {

// TODO: Consider using config from Chrome sync storage.
var config = {
  // Number of rounding decimals for USD value display.
  'USD_DECIMALS': 2,
  // Number of rounding decimals for percentage display.
  'CHANGE_PERCENT_DECIMALS': 2,
  // Number of rounding decimals for crypto currency display.
  'COIN_DECIMALS': 8,
  // Precision for values: everything below is considered 0.
  'VALUE_PRECISION': 1e-8,
  // Period for XHR requests to sync with latest history.
  'HISTORY_UPDATE_INTERVAL_MS': 120000,
  // Maximum time between ticker request (cache time of XHR ticker).
  'TICKER_UPDATE_INTERVAL_MS': 60000,
  // Minimum period for writing to Chrome storage.
  'STORAGE_WRITE_INTERVAL_MS': 10000,
  // Maximum time to wait for the progress bar to start filling up.
  'PROGRESS_MAX_WAIT_MS': 60000,
  // Period for checking the progress bar status.
  'PROGRESS_CHECK_PERIOD_MS': 50,
  // Maximum period for updating the ticker.
  'RENDER_PRICE_UPDATE_PERIOD_MS': 500
}

// The current state.
var state = {
 'history': null,
 'depositsAndWithdrawals': null,
 'tickerData': null,
 'avgBuyPriceOfCoin': null,
 'earningsBtcOfCoin': null,
 'lastStorageWrite': 0,
 'lastHistoryUpdate': 0,
 'lastTickerUpdate': 0,
 'lastDepositsAndWithdrawalsUpdate': 0,
 'priceOfCoin': {},
 'renderPriceInterval': null
};

// State variables which can be cached between page reloads.
var CACHE_STATE_VARS = [
  'history', 'depositsAndWithdrawals', 'avgBuyPriceOfCoin', 'earningsBtcOfCoin',
  'lastStorageWrite', 'lastHistoryUpdate', 'lastDepositsAndWithdrawalsUpdate',
  'priceOfCoin'
];

// Asnychronous version of the each method to keep responsiveness.
$.fn.extend({
  eachAsync: function(callback) {
    $(this).each(function() {
      var $element = $(this);
      setTimeout(function() {
        callback.call($element);
      }, 10);
    })
  }
});

// Returns the current timestamp as integer.
function getTimestamp() {
  return + new Date();
}

// Returns the path portion of the current page without the leading slash.
function getPagePath() {
  var urlParts = window.location.href.split("/");
  return urlParts.splice(3).join("/");
}

// Fires a callback with all results once all methods have completed.
function onAllComplete(asyncMethodMap, callback) {
  var results = {};
  var callbacksRemaining = Object.keys(asyncMethodMap).length;
  for (var name in asyncMethodMap) {
    (function(name, asyncMethod, asyncMethodCallback) {
      asyncMethod(function() {
        $.extend(results, asyncMethodCallback.apply(this, arguments));
        if (--callbacksRemaining == 0) {
          callback(results);
        }
      });
    })(name, asyncMethodMap[name][0], asyncMethodMap[name][1]);
  }
}

// Fires a callback once at init and each time DOM is modified.
function onInitAndChange(query, callback) {
  $(query).eachAsync(function() {
    var $element = $(this);
    $element.bind("DOMSubtreeModified", function(e) {
      callback($element);
    });
    callback($element);
  });
}

// Returns a numeric value from inner HTML (or from an attribute when provided)
// or null if not available.
function getFloatValueFromDom(query, attr) {
  if ($(query).length == 0)
    return null;

  var domValue = attr ? $(query).attr(attr) : $(query).text();
  var value = parseFloat(domValue);
  if (!isNaN(value) && value != Infinity) {
    return value;
  }

  return null;
}

// Formats a value displayed as change with fixed number of decimals and sign.
function formatAsChange(value, decimals) {
  if (isNaN(value) || value == Infinity)
    return "n/a";

  return (value > 0 ? "+" : "") + value.toFixed(decimals);
}

// Returns a USD formatted string from float value.
function formatUsd(value) {
  return "$ " + value.toFixed(config.USD_DECIMALS);
}

// Returns an altcoin formatted string from float value.
function formatCoin(value) {
  return value.toFixed(config.COIN_DECIMALS);
}

// Returns the class of the change.
function getChangeClass(value, prefix) {
  if (isNaN(value) || value == Infinity)
    return "";

  var prefix = prefix || "";
  if (Math.abs(value) < config.VALUE_PRECISION) {
    return prefix + "neutral";
  } else if (value < 0) {
    return prefix + "negative";
  } else {
    return prefix + "positive";
  }
}

// Applies the colorized css class to a cell based on it's value.
function applyChangeClass($cell, value, prefix) {
  var prefix = prefix || "";
  $cell
      .removeClass(prefix + "neutral")
      .removeClass(prefix + "positive")
      .removeClass(prefix + "negative")
      .addClass(getChangeClass(value, prefix));
}

// Computes the growth rate in percentages comparing an old and new value.
// This method may return Infinity if oldValue is 0.
function computeGrowthRate(oldValue, newValue) {
  return (newValue - oldValue) * 100.0 / oldValue;
}

// Applies all settings to the page.
function applySettings(settings) {
  setColumnVisibility(settings.balance_column_visibility);
  setDonationInfoVisibility(settings.display_withdrawal_donation);
  setUntradedRowVisibility(!settings.balance_row_filters.hide_untraded);
  setTickerEnabled(settings.real_time_updates.ticker);
  applyFilterContext();
}

// Apply DOM changes to directives.
function digestDomDirectives(context) {
  var $el = $(context || "body");

  // Apply tooltips to abbr elements.
  $el.find("abbr[title!='']").qtip({
    content: { attr: 'title' },
    style: { classes: 'qtip-dark qtip-rounded qtip-shadow poloTooltips' }
  });

  // Apply changes to images referencing extension data.
  $el.find("img[data-ext-src!='']").each(function() {
    var $img = $(this);
    var extSrc = $img.attr("data-ext-src");
    var extUrl = chrome.extension.getURL(extSrc);
    $img.attr("src", extUrl);
    $img.removeAttr("data-ext-src");
  });
}

// Synchronizes existing and extra options with section applied filter logic.
function applyFilterContext() {
  var anyFilterApplied =
        $(".utilities input[type=checkbox]:checked").length > 0;
    $("section#balances").toggleClass("filtered", anyFilterApplied);
}

// Loads the cached state from Chrome local storage.
function loadCachedState(callback) {
  chrome.storage.local.get('state', function(r) {
    if (r.state) {
      for (var k in state) {
        if (k in r.state) {
          state[k] = r.state[k];
        }
      }
    };
    if (callback) {
      callback(state);
    }
  });
}

// Saves the cached state to Chrome local storage.
function saveCachedState(callback) {
  if ((getTimestamp() - state.lastStorageWrite) >
      config.STORAGE_WRITE_INTERVAL_MS) {
    state.lastStorageWrite = getTimestamp();
    // Scoop up only cacheable vars from state.
    var cachedState = {};
    for (var i = 0; i < CACHE_STATE_VARS; i++) {
      var field = CACHE_STATE_VARS[i];
      if (field in state) {
        cachedState[field] = state;
      }
    }
    chrome.storage.local.set({'state': cachedState}, function() {
      if (callback) {
        callback(state);
      }
    });
  }
}

// Adjusts the theme (dark/light) context.
function adjustTheme() {
  if ($("link[href*='dark']").length > 0) {
    $("body").addClass("poloniex-ninja-dark");
  }
}

// Enables or disables the ticker.
function setTickerEnabled(enabled) {
  if (enabled) {
    WS.setupWebsocket({
      'ticker': function(tickerUpdate) {
        updateLastPrice(tickerUpdate.pair, parseFloat(tickerUpdate.last));
      }
    });
  } else {
    WS.teardownWebsocket();
  }

  // Start/stop the interval for a more seamless experience.
  setPriceUpdateRenderingEnabled(enabled);
}

// Sets up an interval to periodically update the current prices.
function setPriceUpdateRenderingEnabled(enabled) {
  if (enabled) {
    if (state.renderPriceInterval) {
      return;
    }
    console.info("PoloNinja: Enabling ticker rendering.");
    state.renderPriceInterval = setInterval(function() {
      updateAllTickerPrices();
    }, config.RENDER_PRICE_UPDATE_PERIOD_MS);
  } else {
    if (state.renderPriceInterval) {
      console.info("PoloNinja: Disabling ticker rendering.");
      clearInterval(state.renderPriceInterval);
      state.renderPriceInterval = null;
      applyChangeClass($("tr.filterable td[data-last-updated]"), 0.0, "bg-");
    }
  }
}

// Renders initial ticker data and binds to the websocket for real-time updates.
function setupTicker(settings, tickerData) {
  // Apply initial ticker data.
  initializeTicker(tickerData);
  // Listen for ticker changes on WebSocket.
  setTickerEnabled(settings.real_time_updates.ticker);
}

// Updates column visibility from the settings object and adjusts the table
// width according to number of visible columns.
function setColumnVisibility(visibility) {
  var visibleColumnCount = 0;
  for (var column in visibility) {
    var $el = $(".poloniex-ninja." + column);
    if ($el.length == 0)
      continue;

    if (visibility[column]) {
      $el.removeClass("poloniex-ninja-hidden");
      visibleColumnCount++;
    } else {
      $el.addClass("poloniex-ninja-hidden");
    }
  }

  // Stretch the table according to number of visible extra columns.
  $("#content > .main")
      .attr('class', function(i, c) {
        return c.replace(/(^|\s)poloniex-ninja-stretch-\w+/g, '');
      })
      .addClass("poloniex-ninja-stretch-" + visibleColumnCount);
}

// Sets donation at withdrawls visibility.
function setDonationInfoVisibility(visible) {
  if (visible) {
    $(".poloniex-ninja-donation").removeClass("poloniex-ninja-hidden");
    attachDonationInfo();
  } else {
    $(".poloniex-ninja-donation").addClass("poloniex-ninja-hidden");
  }
}

// Sets visibility for rows which haven't been traded.
function setUntradedRowVisibility(visible) {
  // Apply class which will hide all untraded rows.
  $("#balancesTable tbody").toggleClass("poloniex-ninja-filtered-untraded",
                                        !visible);
  // Also update the checkbox state.
  var $hideUntraded = $("#poloniex-ninja-hide-untraded");
  var isChecked = $hideUntraded.is(":checked");
  var shouldBeChecked = !visible;
  if (isChecked != shouldBeChecked) {
    $hideUntraded.prop('checked', shouldBeChecked);
  }
}

// Adds extra info for donations to the provided action row or the one visible.
// The method will check for existance of a donation row and current settings
// before deciding to attach the new DOM.
function attachDonationInfo($actionRow) {
  var $actionRow = $actionRow || $("#actionRow:first");

  if ($actionRow.length == 0)
    return;

  var currency = $actionRow.attr("currency");

  // Remove previous donation elements.
  var $withdrawDiv = $actionRow.find("#withdrawDiv");
  $withdrawDiv.find(".poloniex-ninja-donation").remove();

  // Don't modify for unsupported donation currency.
  if (!(currency in DONATION_CONFIG)) {
    return;
  }

  if (!SETTINGS.display_withdrawal_donation) {
    return;
  }

  console.info(
      "PoloNinja: Adding donation info at bottom of withdrawal form.");

  $donationRow =
      $("<div class='formRow poloniex-ninja-donation'>" +
        "<img width='24' class='icon' data-ext-src='img/icon32x32.png'> " +
        "Find PoloNinja useful? " +
        "<a href='javascript:' id='poloniex-ninja-fill-in-button' " +
           "class='matchLink'>" +
        "<abbr title='By clicking this, it will only fill in the address " +
                     "for the donation. You should then enter the amount " +
                     "and submit yourself. Remember that you also have " +
                     "to confirm the withdrawal by email.'>" +
        "Click to fill in donation address</abbr></a> for " + currency + ". " +
        "Suggested amount: " +
        "<input type='text' readonly class='poloniex-ninja-donation-amount'> " +
        "&nbsp;|&nbsp; " +
        "<a href='javascript:' id='poloniex-ninja-hide-donation-info' " +
           "class='matchLink'><abbr title='You can show this again via " +
        "settings: find the PoloNinja icon in Chrome toolbox.'>Hide</abbr>" +
        "</a></div>");

  var donation = DONATION_CONFIG[currency];
  var fee = getFloatValueFromDom($withdrawDiv.find("#withdrawalTxFee"));
  var amount = formatCoin(donation.amount - fee);
  $withdrawDiv.append($('<hr class="seperator poloniex-ninja-donation">'));
  $withdrawDiv.append($donationRow);
  $donationRow.find(".poloniex-ninja-donation-amount").val(amount);
  $donationRow.find("#poloniex-ninja-fill-in-button").click(function() {
    var $address = $withdrawDiv.find("#withdrawalAddress");
    $address.val(donation.address);
  });
  $donationRow.find("#poloniex-ninja-hide-donation-info").click(function() {
    updateSettings(function(settings) {
      settings.display_withdrawal_donation = false;
    });
  });

  digestDomDirectives($donationRow);
}

// Fires the callback once the progress bar has loaded.
function onProgressComplete(callback) {
  var remainingTime = config.PROGRESS_MAX_WAIT_MS;
  var period = config.PROGRESS_CHECK_PERIOD_MS;
  var interval = setInterval(function() {
    remainingTime -= period;
    if (remainingTime <= 0) {
      clearInterval(interval);
      return;
    }
    var style = $("#wdProgress").attr("style");
    if (style && parseFloat(style.split(': ').pop()) >= 50) {
      callback();
      clearInterval(interval);
    }
  }, period);
}

// Loads the entire trade history for average buy value and change estimate.
// The results may be cached. A callback is executed with the results and
// a boolean argument determining whether the results are cached.
function loadTradeHistory(callback) {
  if ((getTimestamp() - state.lastHistoryUpdate) >
      config.HISTORY_UPDATE_INTERVAL_MS) {
    $.getJSON(
      "/private.php?command=returnPersonalTradeHistory&start=0&end=1917895987",
      function(history) {
        state.history = history;
        state.lastHistoryUpdate = getTimestamp();
        callback(history, /*cached=*/false);
      });
  } else {
    // Provide cached results.
    callback(state.history, /*cached=*/true);
  }
}

// Loads the last 1000 deposits and withdrawals.
function loadDepositsAndWithdrawalsHistory(callback) {
  if ((getTimestamp() - state.lastDepositsAndWithdrawalsUpdate) >
      config.HISTORY_UPDATE_INTERVAL_MS) {
    $.getJSON(
      "/private?command=returnWithdrawalsDeposits&limit=1000",
      function(depositsAndWithdrawals) {
        state.depositsAndWithdrawals = depositsAndWithdrawals;
        state.lastDepositsAndWithdrawalsUpdate = getTimestamp();
        callback(depositsAndWithdrawals, /*cached=*/false);
      });
  } else {
    // Provide cached results.
    callback(state.depositsAndWithdrawals, /*cached=*/true);
  }
}

// Loads the current ticker data for each currency.
function loadTickerData(callback) {
  if ((getTimestamp() - state.lastTickerUpdate) >
      config.TICKER_UPDATE_INTERVAL_MS) {
    $.getJSON(
      "/public.php?command=returnTicker",
      function(tickerData) {
        state.tickerData = tickerData;
        state.lastTickerUpdate = getTimestamp();
        callback(tickerData, /*cached=*/false);
      });
  } else {
    // Provide cached results.
    callback(state.tickerData, /*cached=*/true);
  }
}

// Loads all transactions (trade history and deposits & withdrawals).
function loadTransactions(callback) {
  onAllComplete({
      'loadTradeHistory': [
          loadTradeHistory,
          function(history, cached) {
            return {'history': history, 'historyCached': cached};
          }],
      'loadDepositsAndWithdrawalsHistory': [
          loadDepositsAndWithdrawalsHistory,
          function(depositsAndWithdrawals, cached) {
            return {'depositsAndWithdrawals': depositsAndWithdrawals,
                    'depositsAndWithdrawalsCached': cached};
          }]
      },
      function(results) {
        callback(results.history,
                 results.depositsAndWithdrawals.deposits,
                 results.depositsAndWithdrawals.withdrawals,
                 results.historyCached && results.depositsAndWithdrawalsCached);
      });
}

// Finds the cell in the provided row matching the given header text.
function getCellForHeader($rowElement, headerText) {
  var $matchingHeader =
      $("#balancesTable thead th div:contains('" + headerText + "')");
  if ($matchingHeader.length == 0)
    return null;
  var index = $matchingHeader.closest("th").prevAll().length;
  return $($rowElement).find("td:eq(" + index + ")");
}

// Gets the total estimate of holdings in USD or null if not available.
function getUsdHoldings() {
  return getFloatValueFromDom("#accountValue_usd");
}

// Gets the total estimate of holdings in BTC or null if not available.
function getBtcHoldings() {
  return getFloatValueFromDom("#accountValue_btc");
}

// Returns the bitcoin value in the provided row or null if not available.
function getBitcoinValue($row) {
  var $bitcoinValueCell = getCellForHeader($row, "BTC Value");
  return getFloatValueFromDom($bitcoinValueCell);
}

// Gets the estimated value of BTC in USD or 0 if not available.
function getBtcPriceEstimate() {
  // Attempt getting the freshest price from ticker.
  var btcPrice = getFloatValueFromDom(
    "#balancesTable tr[data-url=BTC] > td.last_usdt_price:first",
    "data-last-value");

  if (btcPrice != null)
    return btcPrice;

  var usdHoldings = getUsdHoldings();
  if (usdHoldings == null || usdHoldings == 0.0)
    return 0.0;

  var btcHoldings = getBtcHoldings();
  if (btcHoldings == null || btcHoldings == 0.0)
    return 0.0;

  return usdHoldings / btcHoldings;
}

// Get the row associated with the coin.
function getCoinRow(coinName) {
  return $("#balancesTable tr[data-url='" + coinName + "']");
}

// Returns the coin name of provided row.
function getRowCoin($row) {
  return $row.attr("data-url");
}

// Fetches the cached historical trade data for a given row and calls the
// callback if data is available.
function getTradeSummaryForRow($row, callback) {
  var coin = getRowCoin($row);
  if (coin == null || state.avgBuyPriceOfCoin == null ||
      !(coin in state.avgBuyPriceOfCoin)) {
    return;
  }

  var currentBalance = getFloatValueFromDom($row.find("td.balance"));
  var btcValue = getFloatValueFromDom($row.find("td.value"));

  var avgBuyPrice = state.avgBuyPriceOfCoin[coin];
  var avgBuyValue = avgBuyPrice * currentBalance;
  var changePercent = computeGrowthRate(avgBuyValue, btcValue);

  callback({
    'avgBuyPrice': avgBuyPrice,
    'avgBuyValue': avgBuyValue,
    'changePercent': changePercent
  });
}

// Updates all coin prices from available ticker data.
function updateAllTickerPrices() {
  $("tr.filterable[data-url!='']:visible").eachAsync(function() {
    var $row = $(this);
    var targetCoin = getRowCoin($row);

    if (!(targetCoin in state.priceOfCoin)) {
      return;
    }

    var prices = state.priceOfCoin[targetCoin];
    for (var baseCoin in prices) {
      var $priceCell =
          $row.find("td.last_" + baseCoin.toLowerCase() + "_price:first");

      if ($priceCell.length == 0)
        continue;

      updateCellWithGrowthIndicator(
          $priceCell, prices[baseCoin], /*isUsd=*/baseCoin=='USDT');
    }
  });
}

// Updates the currency pair last price in the table.
function updateLastPrice(pair, lastPrice) {
  var parts = pair.split('_');
  var baseCoin = parts[0];
  var targetCoin = parts[1];


  if (!(targetCoin in state.priceOfCoin))
    state.priceOfCoin[targetCoin] = {};

  state.priceOfCoin[targetCoin][baseCoin] = lastPrice;
}

// Updates value of cell and marks it with a growth indicator class which
// automatically fades after some short time.
function updateCellWithGrowthIndicator($cell, newValue, isUsd) {
  // Compute the diff and render the value.
  var displayPrice = isUsd ? formatUsd(newValue) : formatCoin(newValue);
  // Don't indicate change when initializing (diff = 0.0).
  var oldValue = $cell.attr("data-last-value") || newValue;
  $cell.attr("data-last-updated", getTimestamp());
  $cell.attr("data-last-value", newValue);
  $cell.html(displayPrice);
  var diff = newValue - oldValue;
  applyChangeClass($cell, diff, "bg-");

  // Neutralize the display class of cell after default timeout.
  if (diff >= config.VALUE_PRECISION) {
    var neutralTimeout = 1000;
    setTimeout(function() {
      if ((getTimestamp() - parseFloat($cell.attr("data-last-updated"))) >
          neutralTimeout) {
        applyChangeClass($cell, 0.0, "bg-");
      }
    }, neutralTimeout * 2);
  }
}

// Updates USD balance on each row.
function updateUsdBalanceColumn($rowQuery) {
  $rowQuery.eachAsync(function() {
    var $row = $(this);
    var bitcoinValue = getBitcoinValue($row);

    if (bitcoinValue == null)
      return;

    var usdValue = bitcoinValue * getBtcPriceEstimate();

    updateCellWithGrowthIndicator(
        $row.find(".usd_value:first"), usdValue, /*isUsd=*/true);
  });
}

// Updates the average buy price, value and other trade related columns
// in one or more rows.
function updateTradeColumns($rowQuery) {
  $rowQuery.eachAsync(function() {
    var $row = $(this);
    getTradeSummaryForRow($row, function(r) {
      var $avgBuyPriceCell = $row.find("td.avg_buy_price");
      var $avgBuyValueCell = $row.find("td.avg_buy_value");
      $avgBuyPriceCell.html(formatCoin(r.avgBuyPrice));
      $avgBuyValueCell.html(formatCoin(r.avgBuyValue));
    });
  });
}

// Updates the earnings columns on each row. If no earnings available, the row
// is declared as untraded.
function updateEarningColumns($rowQuery) {
  if (!state.earningsBtcOfCoin)
    return;

  $rowQuery.eachAsync(function() {
    var $row = $(this);
    var coin = getRowCoin($row);
    if (coin == null)
        return;

    if (!(coin in state.earningsBtcOfCoin)) {
      if (getBitcoinValue($row) < config.VALUE_PRECISION) {
        $row.addClass("poloniex-ninja-untraded");
      }
      return;
    }

    $row.removeClass("poloniex-ninja-untraded");
    var btcPrice = getBtcPriceEstimate();
    var earningsSlsBtc = state.earningsBtcOfCoin[coin];
    var earningsSlsUsd = earningsSlsBtc * btcPrice;

    var $earningsSlsBtcCell = $row.find("td.earnings_sls_btc");
    var $earningsSlsUsdCell = $row.find("td.earnings_sls_usd");
    $earningsSlsBtcCell.html(
          formatAsChange(earningsSlsBtc, config.COIN_DECIMALS));
    applyChangeClass($earningsSlsBtcCell, earningsSlsBtc);
    $earningsSlsUsdCell.html(
        '$ ' + formatAsChange(earningsSlsUsd, config.USD_DECIMALS));
    applyChangeClass($earningsSlsUsdCell, earningsSlsUsd);
  });
}

// Updates the change column in one or more rows.
function updateChangePercent($rowQuery) {
  $rowQuery.eachAsync(function() {
    var $row = $(this);
    getTradeSummaryForRow($row, function(r) {
      var $changePercentCell = $row.find("td.change_percent");
      $changePercentCell.html(formatAsChange(r.changePercent,
                                             config.CHANGE_PERCENT_DECIMALS));
      applyChangeClass($changePercentCell, r.changePercent);
    });
  });
}

// Computes the average buy price from the trade history.
function computeAvgBuyPrice(transactions, boundaryTransactions,
                            currentBalance) {
  var balance = currentBalance;
  var rates = [];
  var totalBuyAmount = 0.0;
  var computed = false;

  // Subtract all deposits and withdrawals from current balance. This will
  // account for the part of the current balance. Notice that withdrawals are
  // always negative.
  for (var i = 0; i < boundaryTransactions.length; i++) {
    balance -= boundaryTransactions[i].amount;
  }

  // Scrub through the history and determine the rates and amounts for buys.
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    var amount = parseFloat(t.amount);
    var fee = parseFloat(t.fee);
    var rate = parseFloat(t.rate);
    var sign = (t.type == "buy") ? 1 : -1;
    var netAmount = amount * (1.0 - fee) * sign;
    balance -= netAmount;

    if (t.type == "buy") {
      rates.push({amount: netAmount, rate: rate});
      totalBuyAmount += netAmount;
    }

    if (balance < config.VALUE_PRECISION)  {
      computed = true;
      break;
    }
  }

  // Failed accoutning for the balance, may be mixture of other currencies.
  if (!computed)
    return null;

  // Compute the average buy price.
  var avgBuyPrice = 0.0;
  for (var i = 0; i < rates.length; i++) {
    avgBuyPrice += rates[i].rate * (rates[i].amount / totalBuyAmount);
  }

  return avgBuyPrice;
}

// Computes the BTC earnings for given coin up until and including the most
// recent sale. This only considers regular exchange trades (buy/sell). If last
// trades were purchases, those are excluded.
function computeEarningsBtc(transactions) {
  var earningsBtc = 0.0;
  var saleFound = false;
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    if (t.type == "buy" && saleFound) {
      earningsBtc -= parseFloat(t.total);
    } else if (t.type == "sell") {
      earningsBtc += parseFloat(t.total) * (1.0 - parseFloat(t.fee));
      saleFound = true;
    }
    // FIXME: At some point loans should also be considered.
  }

  return earningsBtc;
}

// Computes the boundary transactions: deposits and withdrawals as the same
// type of entry.
function computeBoundaryTransactions(deposits, withdrawals) {
  var boundaryTransactions = {};
  for (var i = 0; i < deposits.length; i++) {
    var item = deposits[i];
    if (!(item.currency in boundaryTransactions)) {
      boundaryTransactions[item.currency] = [];
    }

    if (item.status != "COMPLETE")
      continue;

    boundaryTransactions[item.currency].push({
      'amount': parseFloat(item.amount),
      'type': 'deposit',
      'currency': item.currency
    });
  }

  for (var i = 0; i < withdrawals.length; i++) {
    var item = withdrawals[i];
    if (!(item.currency in boundaryTransactions)) {
      boundaryTransactions[item.currency] = [];
    }

    if (item.status.indexOf("COMPLETE") < 0)
      continue;

    boundaryTransactions[item.currency].push({
      'amount': -1.0 * (parseFloat(item.amount) + parseFloat(item.fee)),
      'type': 'withdrawal',
      'currency': item.currency
    });
  }

  return boundaryTransactions;
}

// Loads the historical data and saves to the state cache.
// If a callback is provided, it will execute once the cache has been updated.
function computeColumnsFromTradesAsync(callback, forceRecompute) {
  loadTransactions(function(history, deposits, withdrawals, cached) {
    // We don't need to recompute on the cached history unless this is indicated
    // to be the first call via forceRecompute.
    if (!forceRecompute && cached && callback) {
      callback();
      return;
    }

    var boundaryTransactions =
        computeBoundaryTransactions(deposits, withdrawals);

    state.avgBuyPriceOfCoin = {}
    state.earningsBtcOfCoin = {}
    for (var pair in history) {
      var parts = pair.split("_");
      var baseCoin = parts[0];

      // FIXME: Only supporting BTC trading for now.
      if (baseCoin != "BTC") {
        continue;
      }

      var targetCoin = parts[1];
      var $row = getCoinRow(targetCoin);
      var currentBalance = getFloatValueFromDom($row.find("td.balance"));

      state.earningsBtcOfCoin[targetCoin] = computeEarningsBtc(history[pair]);

      // Skip near zero balance.
      if (currentBalance < config.VALUE_PRECISION) {
        continue;
      }

      // Store the results.
      state.avgBuyPriceOfCoin[targetCoin] =
          computeAvgBuyPrice(history[pair],
                             boundaryTransactions[targetCoin] || [],
                             currentBalance);
    }

    if (callback) {
      callback();
    }

    saveCachedState();
  });
}

// Adds the extra columns for the current balances.
function setupExtraBalanceTableColumns(settings) {
  console.info("PoloNinja: Adding extra balance columns.");

  // Fix the dynamic rows on deposit/withdraw and add donation elements.
  $("#balancesTable tbody").on("DOMNodeInserted", "tr", function(e) {
    if ($(e.target).attr("id") == "actionRow") {
      $(e.target).find("td:first").attr(
          "colspan", $("#balancesTable thead tr th").length);
      attachDonationInfo($(e.target));
    }
  });

  // Attach headers.
  var $lastHeader = $("#balancesTable thead:first tr th:last");
  for (var i = 0; i < EXTRA_BALANCE_COLUMNS.length; i++) {
    var col = EXTRA_BALANCE_COLUMNS[i];
    var header = col.title;
    var $th =
        $("<th class='poloniex-ninja " + col.key + "'>" + col.title + "</th>");
    if ('description' in col) {
      $th.attr("data-tooltip", col.description);
    }
    $th.toggleClass("poloniex-ninja-hidden",
                    !settings.balance_column_visibility[col.key]);
    $th.insertBefore($lastHeader);
  }

  // Apply tooltips to headers.
  $('th.poloniex-ninja[data-tooltip!=""]').qtip({
      content: { attr: 'data-tooltip' },
      style: { classes: 'qtip-dark qtip-rounded qtip-shadow poloTooltips' }
  });

  // Add extra cells for USD as each row is inserted.
  $("#balancesTable tbody").on("DOMNodeInserted", "tr", function(x) {
    if (x.target.nodeName != "TR" || !$(x.target).hasClass("filterable"))
      return;

    var $row = $(x.target);

    // Skip row if already initialized.
    if ($row.find(".poloniex-ninja").length > 0)
      return;

    // Add placeholder cells.
    var $lastColumn = $row.find("td:last");
    for (var i = 0; i < EXTRA_BALANCE_COLUMNS.length; i++) {
      var col = EXTRA_BALANCE_COLUMNS[i];
      var $td = $("<td class='poloniex-ninja " + col.key +
                  "' nowrap><small>n/a</small></td>");
      $td.toggleClass("poloniex-ninja-hidden",
                      !settings.balance_column_visibility[col.key]);
      $td.insertBefore($lastColumn);
      $td.addClass(col.class);
    }
  });

  // Once the progress bar has indicated that stuff is loaded and we got the
  // transaction history cached, fill out the columns and bind events.
  onAllComplete(
      {'onProgressComplete': [onProgressComplete, function() { return {}; }],
       'loadTransactions': [loadTransactions, function() { return {}; }],
       'loadTickerData': [loadTickerData, function(tdata) { return tdata; }]},
      function(tickerData) {
        // Listen for ticker updates.
        setupTicker(settings, tickerData);

        computeColumnsFromTradesAsync(function() {
          // Apply any changed settings between initial load and data available.
          loadSettings(applySettings);

          var $filterable = $("#balancesTable tbody tr.filterable");

          // Update avg buy price, value and earnings as total balance changes.
          onInitAndChange(
              $filterable.find("td.balance"),
              function($cell) {
                computeColumnsFromTradesAsync(function() {
                  var $row = $cell.closest("tr");
                  updateTradeColumns($row);
                  updateEarningColumns($row);
                });
              });

          // Update the change column as avg buy value or btc value changes.
          onInitAndChange(
              $filterable.find("td.value, td.avg_buy_value, td.avg_buy_price"),
              function($cell) {
                updateChangePercent($cell.closest("tr"));
              });

          // Update USD prices and earnings as bitcoin value changes.
          onInitAndChange(
              $filterable.find("td.value"),
              function($cell) {
                var $row = $cell.closest("tr");
                updateUsdBalanceColumn($row);
                updateEarningColumns($row);
              });

          var updateAll = function() {
            updateUsdBalanceColumn($filterable);
            computeColumnsFromTradesAsync(function() {
              updateTradeColumns($filterable);
              updateEarningColumns($filterable);
            });
          }

          // Update all extra columns as the price changes.
          onInitAndChange(
              "#accountValue_btc, " +
              "#balancesTable tr[data-url=BTC] > td.last_usdt_price:first",
              updateAll);
        }, /*forceRecompute=*/true);  // computeColumnsFromTradesAsync
      });  // onAllComplete
}

// Adds extra filter options at top of the table.
function setupExtraFilteringOptions(settings) {
  console.info("PoloNinja: Adding extra filtering options for rows.");
  var $utils = $(".utilities:first");
  var $option = $('<span class="poloniex-ninja-filter-option">' +
                  '<input type="checkbox" ' +
                  'id="poloniex-ninja-hide-untraded" value="">' +
                  '<label for="poloniex-ninja-hide-untraded">' +
                  'Hide Untraded</label></span>');
  $utils.append($option);
  var $hideUntraded = $option.find("#poloniex-ninja-hide-untraded");
  $hideUntraded.change(function() {
    var isChecked = $(this).is(":checked");
    updateSettings(function(settings) {
      settings.balance_row_filters.hide_untraded = isChecked;
    });
  });

  $hideUntraded.prop("checked", settings.balance_row_filters.hide_untraded);

  // Listen for changes and sync with filtering context.
  $(".utilities").on("change", "input[type=checkbox]", function() {
    applyFilterContext();
  });

  // Reset filters button should include the extra options as well.
  $(".resetFilters").click(function() {
    updateSettings(function(settings) {
      settings.balance_row_filters.hide_untraded = false;
    });
  });
}

// Sets the last prices for each currency from all available ticker data.
function initializeTicker(tickerData) {
  for (var pair in tickerData) {
    try {
      updateLastPrice(pair, parseFloat(tickerData[pair].last));
    } catch (ex) {
      console.warn("PoloNinja: Failed initializing ticker.");
    }
  }
  updateAllTickerPrices();
}

// Program entry point.
function main() {
  // Match the page and apply a DOM layer.
  if (getPagePath().match(/balances.*/)) {
    loadSettings(function(settings) {
      loadCachedState(function() {
        setupExtraBalanceTableColumns(settings);
        setupExtraFilteringOptions(settings);
      });
    });

    // Dark/Light adjustments.
    adjustTheme();

    // Listen for live settings changes.
    onSettingsChanged(applySettings);
  } else {
    console.info("PoloNinja: No modifications were done on this page.");
  }
}

main();

})();  // Scope isolation.
