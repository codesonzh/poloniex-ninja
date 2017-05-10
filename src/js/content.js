(function() {

// TODO: Use config from user storage obtained from background script.
var config = {
  'USD_DECIMALS': 2,
  'CHANGE_PERCENT_DECIMALS': 2,
  'AVG_BUY_PRICE_DECIMALS': 8,
  'BALANCE_PRECISION': 1e-7,
  'CHANGE_PRECISION': 0.01
}

// The current state.
var state = {'data': null,
             'balancesLoaded': false};

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
function loadTradeHistory(callback) {
  $.getJSON(
    "/private.php?command=returnPersonalTradeHistory&start=0&end=1917895987",
    callback);
}

// Fires a callback once at init and each time DOM is modified.
function onChangeOrInit($cell, callback) {
  $cell.bind("DOMSubtreeModified", function(e) {
    callback($cell);
  });
  callback($cell);
  return callback;
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

// Updates balance on each row.
function updateUsdBalance($rowQuery) {
  $rowQuery.each(function() {
    if (!state.data)
      return;

    var $row = $(this);
    var $bitcoinValueCell = getCellForHeader($row, "BTC Value");

    if ($bitcoinValueCell == null)
      return;

    var bitcoinValue = parseFloat($bitcoinValueCell.text());
    var usdValue =
        (bitcoinValue * state.data.btcPrice).toFixed(config.USD_DECIMALS);
    $row.find(".usd-value:first").html("$ " + usdValue);
  });
}

// Returns a numeric value from inner HTML or null if not available.
function getFloatValueFromDom(query) {
  if ($(query).length == 0)
    return null;

  var value = parseFloat($(query).html());
  if (value != NaN || value != Infinity) {
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

// Computes the average buy price and value from the trade history.
// Also computes the current change percentage compared to the historical price.
// May return null when failing to account for the current balance (i.e. mixed
// currencies in balance).
function computeHistoryValueAndChange(transactions, currentBalance, btcValue) {
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

  // Compute the average buy price, value at that price and change
  // percentage.
  var avgBuyPrice = 0.0;
  for (var i = 0; i < rates.length; i++) {
    avgBuyPrice += rates[i].rate * (rates[i].amount / totalBuyAmount);
  }
  var avgBuyValue = avgBuyPrice * currentBalance;
  var changePercent = (btcValue - avgBuyValue) * 100 / avgBuyValue;

  return {
    'avgBuyPrice': avgBuyPrice,
    'avgBuyValue': avgBuyValue,
    'changePercent': changePercent
  };
}

// Updates the extra columns for analysis. Triggered once balances have been
// loaded.
function computeExtraColumnsAsync() {
  loadTradeHistory(function(history) {
    for (var pair in history) {
      var parts = pair.split("_");
      var baseCoin = parts[0];

      // FIXME: Only supporting BTC trading for now.
      if (baseCoin != "BTC")
        continue;

      var targetCoin = parts[1];
      var $row = getCoinRow(targetCoin);
      var $balanceCell = getCellForHeader($row, "Total Balance");
      var currentBalance = getFloatValueFromDom($balanceCell);

      // Skip near zero balance.
      if (currentBalance < config.BALANCE_PRECISION)
        continue;

      var $btcValueCell = getCellForHeader($row, "BTC Value");
      var btcValue = getFloatValueFromDom($btcValueCell);

      var transactions = history[pair];
      var r = computeHistoryValueAndChange(transactions,
                                           currentBalance,
                                           btcValue);
      if (r == null)
        continue;

      // Update the cells.
      var $avgBuyPriceCell = $row.find("td.avg-buy-price");
      var $avgBuyValueCell = $row.find("td.avg-buy-value");
      var $changePercentCell = $row.find("td.change-percent");
      $avgBuyPriceCell.html(
          r.avgBuyPrice.toFixed(config.AVG_BUY_PRICE_DECIMALS));
      $avgBuyValueCell.html(
          r.avgBuyValue.toFixed(config.AVG_BUY_PRICE_DECIMALS));
      $changePercentCell.html(
          r.changePercent.toFixed(config.CHANGE_PERCENT_DECIMALS));
      $changePercentCell.addClass(getChangeClass(r.changePercent));
    }
  });
}

// Adds the extra columns for the current balances.
function addExtraBalanceTableColumns() {
  console.info("PoloNinja: Adding extra balance columns.");

  state.data = {btcPrice: getBtcPriceEstimate()};

  // Update USD prices and extra columns as the price changes.
  onChangeOrInit($("#accountValue_btc"), function() {
    state.data.btcPrice = getBtcPriceEstimate();
    updateUsdBalance($("#balancesTable tbody tr"));
    computeExtraColumnsAsync();
  });

  // Fix the dynamic rows on deposit/withdraw.
  $("#balancesTable tbody").on("DOMNodeInserted", "tr", function(e) {
    if ($(e.target).attr("id") == "actionRow") {
      $(e.target).find("td:first").attr(
          "colspan", $("#balancesTable thead tr th").length);
    }
  });

  // Attach headers.
  var $lastHeader = $("#balancesTable thead:first tr th:last");
  $("<th class='poloniex-ninja'>AVG buy price</th>").insertBefore($lastHeader);
  $("<th class='poloniex-ninja'>AVG buy value</th>").insertBefore($lastHeader);
  $("<th class='poloniex-ninja'>Change</th>").insertBefore($lastHeader);
  $("<th class='poloniex-ninja'>USD Value</th>").insertBefore($lastHeader);

  // Add extra cells for USD as each row is inserted.
  $("#balancesTable tbody").on("DOMNodeInserted", "tr", function(x) {
    if (x.target.nodeName == "TR" && $(x.target).hasClass("filterable")) {
      var $row = $(x.target);

      if ($row.find(".usd-value").length > 0)
        return;

      var $bitcoinValueCell = getCellForHeader($row, "BTC Value");
      if ($bitcoinValueCell == null)
        return;

      // Add placeholder cells.
      var $lc = $row.find("td:last");
      $("<td class='poloniex-ninja avg-buy-price'>n/a</td>").insertBefore($lc);
      $("<td class='poloniex-ninja avg-buy-value'>n/a</td>").insertBefore($lc);
      $("<td class='poloniex-ninja change-percent'>n/a</td>").insertBefore($lc);
      $("<td class='poloniex-ninja usd-value'>n/a</td>").insertBefore($lc);

      // Update USD prices as bitcoin value changes.
      onChangeOrInit($bitcoinValueCell, function($cell) {
        updateUsdBalance($cell.closest("tr"));
      });

      // Rows are getting inserted so we assume the balances have been loaded.
      // We can fire the event now to do additional computation.
      if (!state.balancesLoaded) {
        state.balancesLoaded = true;
        computeExtraColumnsAsync();
      }
    }
  });
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
