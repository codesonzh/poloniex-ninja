(function() {

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

// TODO: Use config from user storage obtained from background script.
var config = {
  'USD_DECIMALS': 2,
  'CHANGE_PERCENT_DECIMALS': 2,
  'AVG_BUY_PRICE_DECIMALS': 8,
  'BALANCE_PRECISION': 1e-7,
  'CHANGE_PRECISION': 0.01,
  'HISTORY_UPDATE_INTERVAL_MS': 60000
}

// The current state.
var state = {'data': null,
             'history': null,
             'avgBuyPriceOfCoin': null,
             'lastHistoryUpdate': 0};

function getTimestamp() {
  return + new Date();
}

// Returns the path portion of the current page without the leading slash.
function getPagePath() {
  var urlParts = window.location.href.split("/");
  return urlParts.splice(3).join("/");
}

// Adjusts the theme (dark/light) context.
function adjustTheme() {
  if ($("link[href*='dark']").length > 0) {
    $("body").addClass("poloniex-ninja-dark");
  }
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

// Finds the cell in the provided row matching the given header text.
function getCellForHeader($rowElement, headerText) {
  var $matchingHeader =
      $("#balancesTable thead th div:contains('" + headerText + "')");
  if ($matchingHeader.length == 0)
    return null;
  var index = $matchingHeader.closest("th").prevAll().length;
  return $($rowElement).find("td:eq(" + index + ")");
}

// Returns a numeric value from inner HTML or null if not available.
function getFloatValueFromDom(query) {
  if ($(query).length == 0)
    return null;

  var value = parseFloat($(query).text());
  if (value != NaN && value != Infinity) {
    return value;
  }

  return null;
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

// Updates USD balance on each row.
function updateUsdBalance($rowQuery) {
  $rowQuery.eachAsync(function() {
    if (!state.data)
      return;

    var $row = $(this);
    var bitcoinValue = getBitcoinValue($row);

    if (bitcoinValue == null)
      return;

    var usdValue =
        (bitcoinValue * state.data.btcPrice).toFixed(config.USD_DECIMALS);

    $row.find(".usd-value:first").html("$ " + usdValue);
  });
}

// Fetches the cached historical avgBuyPrice for a given row and calls the
// callback when data is available.
function getHistoricalSummary($row, callback) {
  var coin = $row.find("td.coin").text();
  if (coin == null || state.avgBuyPriceOfCoin == null ||
      !(coin in state.avgBuyPriceOfCoin)) {
    return;
  }

  var currentBalance = getFloatValueFromDom($row.find("td.balance"));
  var btcValue = getFloatValueFromDom($row.find("td.value"));

  var avgBuyPrice = state.avgBuyPriceOfCoin[coin];
  var avgBuyValue = avgBuyPrice * currentBalance;
  var changePercent = (btcValue - avgBuyValue) * 100 / avgBuyValue;

  callback({
    'avgBuyPrice': avgBuyPrice,
    'avgBuyValue': avgBuyValue,
    'changePercent': changePercent
  });
}

// Updates the average buy price and value in one or more rows.
function updateAvgBuyPriceAndValue($rowQuery) {
  $rowQuery.eachAsync(function() {
    var $row = $(this);
    getHistoricalSummary($row, function(r) {
      var $avgBuyPriceCell = $row.find("td.avg-buy-price");
      var $avgBuyValueCell = $row.find("td.avg-buy-value");
      $avgBuyPriceCell.html(
          r.avgBuyPrice.toFixed(config.AVG_BUY_PRICE_DECIMALS));
      $avgBuyValueCell.html(
          r.avgBuyValue.toFixed(config.AVG_BUY_PRICE_DECIMALS));
    });
  });
}

// Formats the change percentage.
function formatChangePercent(changePercent) {
  return (changePercent > 0 ? "+": "") +
         changePercent.toFixed(config.CHANGE_PERCENT_DECIMALS);
}

// Updates the change column in one or more rows.
function updateChangePercent($rowQuery) {
  $rowQuery.eachAsync(function() {
    var $row = $(this);
    getHistoricalSummary($row, function(r) {
      var $changePercentCell = $row.find("td.change-percent");
      $changePercentCell.html(formatChangePercent(r.changePercent));
      $changePercentCell
        .removeClass("neutral")
        .removeClass("positive")
        .removeClass("negative")
        .addClass(getChangeClass(r.changePercent));
    });
  });
}

// Gets the estimated value or 0 if not available.
function getBtcPriceEstimate() {
 var usdHoldings = getUsdHoldings();
 if (usdHoldings == null)
   return 0.0;

 var btcHoldings = getBtcHoldings();
 if (btcHoldings == null)
   return 0.0;

 if (btcHoldings == 0.0)
  return 0.0;

  return usdHoldings / btcHoldings;
}

// Get the row associated with the coin.
function getCoinRow(coinName) {
  return $("#balancesTable td.coin a:contains(" + coinName + ")").closest("tr");
}

// Returns the class of the change.
function getChangeClass(changePercent) {
  if (Math.abs(changePercent) < config.BALANCE_PRECISION) {
    return "neutral";
  } else if (changePercent < 0) {
    return "negative";
  } else {
    return "positive";
  }
}

// Computes the average buy price from the trade history.
function computeAvgBuyPrice(transactions, currentBalance) {
  var balance = currentBalance;
  var rates = [];
  var totalBuyAmount = 0.0;
  var computed = false;

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

    if (balance < config.BALANCE_PRECISION)  {
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

// Fires the callback once the progress bar has loaded.
function onProgressComplete(callback) {
  var remainingTime = 30000;
  var period = 10;
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

// Loads the historical data and saves to the state cache.
// If a callback is provided, it will execute once the cache has been updated.
function computeAvgBuyPriceAsync(callback) {
  loadTradeHistory(function(history, cached) {
    // We don't need to recompute on the cached history.
    if (cached && callback) {
      callback();
      return;
    }

    state.avgBuyPriceOfCoin = {}
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

      // Skip near zero balance.
      if (currentBalance < config.BALANCE_PRECISION) {
        continue;
      }

      // Store the results.
      state.avgBuyPriceOfCoin[targetCoin] =
          computeAvgBuyPrice(history[pair], currentBalance);
    }

    if (callback) {
      callback();
    }
  });
}

// Adds the extra columns for the current balances.
function addExtraBalanceTableColumns() {
  console.info("PoloNinja: Adding extra balance columns.");

  state.data = {btcPrice: getBtcPriceEstimate()};

  // Fix the dynamic rows on deposit/withdraw.
  $("#balancesTable tbody").on("DOMNodeInserted", "tr", function(e) {
    if ($(e.target).attr("id") == "actionRow") {
      $(e.target).find("td:first").attr(
          "colspan", $("#balancesTable thead tr th").length);
    }
  });

  // Attach headers.
  var $lastHeader = $("#balancesTable thead:first tr th:last");
  $("<th class='poloniex-ninja'>AVG Buy Price</th>").insertBefore($lastHeader);
  $("<th class='poloniex-ninja'>AVG Buy Value</th>").insertBefore($lastHeader);
  $("<th class='poloniex-ninja'>Change</th>").insertBefore($lastHeader);
  $("<th class='poloniex-ninja'>USD Value</th>").insertBefore($lastHeader);

  // Add extra cells for USD as each row is inserted.
  $("#balancesTable tbody").on("DOMNodeInserted", "tr", function(x) {
    if (x.target.nodeName != "TR" || !$(x.target).hasClass("filterable"))
      return;

    var $row = $(x.target);

    // Skip row if already initialized.
    if ($row.find(".usd-value").length > 0)
      return;

    // Add placeholder cells.
    var $lc = $row.find("td:last");
    $("<td class='poloniex-ninja avg-buy-price'>n/a</td>").insertBefore($lc);
    $("<td class='poloniex-ninja avg-buy-value'>n/a</td>").insertBefore($lc);
    $("<td class='poloniex-ninja change-percent'>n/a</td>").insertBefore($lc);
    $("<td class='poloniex-ninja usd-value'>n/a</td>").insertBefore($lc);
  });

  // Once the progress bar has indicated that stuff is loaded, fill out the
  // columns and bind events.
  onProgressComplete(function() {
    computeAvgBuyPriceAsync(function() {
      var $filterable = $("#balancesTable tbody tr.filterable");

      // Update avg buy price and value as total balance changes.
      onInitAndChange(
          $filterable.find("td.balance"),
          function($cell) {
            computeAvgBuyPriceAsync(function() {
              updateAvgBuyPriceAndValue($cell.closest("tr"));
            });
          });

      // Update the change column as avg buy value or btc value changes.
      onInitAndChange(
          $filterable.find("td.value, td.avg-buy-value, td.avg-buy-price"),
          function($cell) {
            updateChangePercent($cell.closest("tr"));
          });

      // Update USD prices as bitcoin value changes.
      onInitAndChange(
          $filterable.find("td.value"),
          function($cell) {
            updateUsdBalance($cell.closest("tr"));
          });

      // Update all extra columns as the price changes.
      onInitAndChange(
          "#accountValue_btc",
          function() {
            state.data.btcPrice = getBtcPriceEstimate();
            updateUsdBalance($("#balancesTable tbody tr.filterable"));
            computeAvgBuyPriceAsync(function() {
              updateAvgBuyPriceAndValue(
                  $("#balancesTable tbody tr.filterable"));
            });
          });
    });  // computeAvgBuyPriceAsync
  });  // onProgressComplete
}

// Program entry point.
function main() {
  // Match the page and apply a DOM layer.
  var doAdjustTheme = true;
  if (getPagePath().match(/balances.*/)) {
    addExtraBalanceTableColumns();
  } else {
    console.info("PoloNinja: No modifications were done on this page.");
    doAdjustTheme = false;
  }

  if (doAdjustTheme) {
    adjustTheme();
  }
}

main();

})();  // Scope isolation.
