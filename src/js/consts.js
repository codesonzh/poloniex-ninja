// FIXME: We should be able to fetch this data via XHR.
/*

Currently we can update this like so:
Go to https://poloniex.com/exchange and open chrome console.

Run this JS:

copy("var MARKETS_BY_ID = " + JSON.stringify(markets.byID, null, 2));

*/

var MARKETS_BY_ID;

// A small 'hack' to update this map to the current values.
$.get("/balances", function(html) {
  try {
    // Parse the markets JSON from the /balances page inline javascript.
    var currentMarketsById =
        JSON.parse(/\s*var markets = (.*?);/.exec(html)[1]).byID;

    // Validate the entries.
    var validator =
      {
        "id": Number.isInteger,
        "baseID": Number.isInteger,
        "quoteID": Number.isInteger,
        "base": function(v) { return /^[A-Z0-9]+$/.test(v); },
        "quote": function(v) { return /^[A-Z0-9]+$/.test(v); },
        "currencyPair": function(v) { return /^[A-Z0-9]+\_[A-Z0-9]+$/.test(v); }
      };

    for (var id in currentMarketsById) {
      var pair = currentMarketsById[id];
      for (var key in validator) {
        if (!(key in pair)) {
          console.warn("PoloNinja: MARKETS_BY_ID pair is missing key: ", key);
          return;
        }
        if (!validator[key](pair[key])) {
          console.warn(
              "PoloNinja: MARKETS_BY_ID pair failed validation:",
              key,
              pair[key]);
          return;
        }
      }
    }
    // Assume we got the right thing from parsing the HTML as it passed basic
    // validation.
    MARKETS_BY_ID = currentMarketsById;
    console.log("PoloNinja: Updated to current markets for live ticker.");
  } catch (e) {
    console.error("PoloNinja: MARKETS_BY_ID failed parsing.", e);
  }
});

MARKETS_BY_ID = {
  "7": {
    "id": 7,
    "baseID": 28,
    "quoteID": 17,
    "base": "BTC",
    "quote": "BCN",
    "currencyPair": "BTC_BCN"
  },
  "14": {
    "id": 14,
    "baseID": 28,
    "quoteID": 32,
    "base": "BTC",
    "quote": "BTS",
    "currencyPair": "BTC_BTS"
  },
  "15": {
    "id": 15,
    "baseID": 28,
    "quoteID": 34,
    "base": "BTC",
    "quote": "BURST",
    "currencyPair": "BTC_BURST"
  },
  "20": {
    "id": 20,
    "baseID": 28,
    "quoteID": 43,
    "base": "BTC",
    "quote": "CLAM",
    "currencyPair": "BTC_CLAM"
  },
  "24": {
    "id": 24,
    "baseID": 28,
    "quoteID": 60,
    "base": "BTC",
    "quote": "DASH",
    "currencyPair": "BTC_DASH"
  },
  "25": {
    "id": 25,
    "baseID": 28,
    "quoteID": 53,
    "base": "BTC",
    "quote": "DGB",
    "currencyPair": "BTC_DGB"
  },
  "27": {
    "id": 27,
    "baseID": 28,
    "quoteID": 59,
    "base": "BTC",
    "quote": "DOGE",
    "currencyPair": "BTC_DOGE"
  },
  "38": {
    "id": 38,
    "baseID": 28,
    "quoteID": 93,
    "base": "BTC",
    "quote": "GAME",
    "currencyPair": "BTC_GAME"
  },
  "43": {
    "id": 43,
    "baseID": 28,
    "quoteID": 105,
    "base": "BTC",
    "quote": "HUC",
    "currencyPair": "BTC_HUC"
  },
  "50": {
    "id": 50,
    "baseID": 28,
    "quoteID": 125,
    "base": "BTC",
    "quote": "LTC",
    "currencyPair": "BTC_LTC"
  },
  "51": {
    "id": 51,
    "baseID": 28,
    "quoteID": 127,
    "base": "BTC",
    "quote": "MAID",
    "currencyPair": "BTC_MAID"
  },
  "58": {
    "id": 58,
    "baseID": 28,
    "quoteID": 143,
    "base": "BTC",
    "quote": "OMNI",
    "currencyPair": "BTC_OMNI"
  },
  "61": {
    "id": 61,
    "baseID": 28,
    "quoteID": 151,
    "base": "BTC",
    "quote": "NAV",
    "currencyPair": "BTC_NAV"
  },
  "64": {
    "id": 64,
    "baseID": 28,
    "quoteID": 155,
    "base": "BTC",
    "quote": "NMC",
    "currencyPair": "BTC_NMC"
  },
  "69": {
    "id": 69,
    "baseID": 28,
    "quoteID": 162,
    "base": "BTC",
    "quote": "NXT",
    "currencyPair": "BTC_NXT"
  },
  "75": {
    "id": 75,
    "baseID": 28,
    "quoteID": 172,
    "base": "BTC",
    "quote": "PPC",
    "currencyPair": "BTC_PPC"
  },
  "89": {
    "id": 89,
    "baseID": 28,
    "quoteID": 198,
    "base": "BTC",
    "quote": "STR",
    "currencyPair": "BTC_STR"
  },
  "92": {
    "id": 92,
    "baseID": 28,
    "quoteID": 204,
    "base": "BTC",
    "quote": "SYS",
    "currencyPair": "BTC_SYS"
  },
  "97": {
    "id": 97,
    "baseID": 28,
    "quoteID": 218,
    "base": "BTC",
    "quote": "VIA",
    "currencyPair": "BTC_VIA"
  },
  "100": {
    "id": 100,
    "baseID": 28,
    "quoteID": 221,
    "base": "BTC",
    "quote": "VTC",
    "currencyPair": "BTC_VTC"
  },
  "108": {
    "id": 108,
    "baseID": 28,
    "quoteID": 233,
    "base": "BTC",
    "quote": "XCP",
    "currencyPair": "BTC_XCP"
  },
  "112": {
    "id": 112,
    "baseID": 28,
    "quoteID": 256,
    "base": "BTC",
    "quote": "XEM",
    "currencyPair": "BTC_XEM"
  },
  "114": {
    "id": 114,
    "baseID": 28,
    "quoteID": 240,
    "base": "BTC",
    "quote": "XMR",
    "currencyPair": "BTC_XMR"
  },
  "116": {
    "id": 116,
    "baseID": 28,
    "quoteID": 242,
    "base": "BTC",
    "quote": "XPM",
    "currencyPair": "BTC_XPM"
  },
  "117": {
    "id": 117,
    "baseID": 28,
    "quoteID": 243,
    "base": "BTC",
    "quote": "XRP",
    "currencyPair": "BTC_XRP"
  },
  "121": {
    "id": 121,
    "baseID": 214,
    "quoteID": 28,
    "base": "USDT",
    "quote": "BTC",
    "currencyPair": "USDT_BTC"
  },
  "122": {
    "id": 122,
    "baseID": 214,
    "quoteID": 60,
    "base": "USDT",
    "quote": "DASH",
    "currencyPair": "USDT_DASH"
  },
  "123": {
    "id": 123,
    "baseID": 214,
    "quoteID": 125,
    "base": "USDT",
    "quote": "LTC",
    "currencyPair": "USDT_LTC"
  },
  "124": {
    "id": 124,
    "baseID": 214,
    "quoteID": 162,
    "base": "USDT",
    "quote": "NXT",
    "currencyPair": "USDT_NXT"
  },
  "125": {
    "id": 125,
    "baseID": 214,
    "quoteID": 198,
    "base": "USDT",
    "quote": "STR",
    "currencyPair": "USDT_STR"
  },
  "126": {
    "id": 126,
    "baseID": 214,
    "quoteID": 240,
    "base": "USDT",
    "quote": "XMR",
    "currencyPair": "USDT_XMR"
  },
  "127": {
    "id": 127,
    "baseID": 214,
    "quoteID": 243,
    "base": "USDT",
    "quote": "XRP",
    "currencyPair": "USDT_XRP"
  },
  "129": {
    "id": 129,
    "baseID": 240,
    "quoteID": 17,
    "base": "XMR",
    "quote": "BCN",
    "currencyPair": "XMR_BCN"
  },
  "132": {
    "id": 132,
    "baseID": 240,
    "quoteID": 60,
    "base": "XMR",
    "quote": "DASH",
    "currencyPair": "XMR_DASH"
  },
  "137": {
    "id": 137,
    "baseID": 240,
    "quoteID": 125,
    "base": "XMR",
    "quote": "LTC",
    "currencyPair": "XMR_LTC"
  },
  "138": {
    "id": 138,
    "baseID": 240,
    "quoteID": 127,
    "base": "XMR",
    "quote": "MAID",
    "currencyPair": "XMR_MAID"
  },
  "140": {
    "id": 140,
    "baseID": 240,
    "quoteID": 162,
    "base": "XMR",
    "quote": "NXT",
    "currencyPair": "XMR_NXT"
  },
  "148": {
    "id": 148,
    "baseID": 28,
    "quoteID": 267,
    "base": "BTC",
    "quote": "ETH",
    "currencyPair": "BTC_ETH"
  },
  "149": {
    "id": 149,
    "baseID": 214,
    "quoteID": 267,
    "base": "USDT",
    "quote": "ETH",
    "currencyPair": "USDT_ETH"
  },
  "150": {
    "id": 150,
    "baseID": 28,
    "quoteID": 268,
    "base": "BTC",
    "quote": "SC",
    "currencyPair": "BTC_SC"
  },
  "155": {
    "id": 155,
    "baseID": 28,
    "quoteID": 271,
    "base": "BTC",
    "quote": "FCT",
    "currencyPair": "BTC_FCT"
  },
  "162": {
    "id": 162,
    "baseID": 28,
    "quoteID": 277,
    "base": "BTC",
    "quote": "DCR",
    "currencyPair": "BTC_DCR"
  },
  "163": {
    "id": 163,
    "baseID": 28,
    "quoteID": 278,
    "base": "BTC",
    "quote": "LSK",
    "currencyPair": "BTC_LSK"
  },
  "166": {
    "id": 166,
    "baseID": 267,
    "quoteID": 278,
    "base": "ETH",
    "quote": "LSK",
    "currencyPair": "ETH_LSK"
  },
  "167": {
    "id": 167,
    "baseID": 28,
    "quoteID": 280,
    "base": "BTC",
    "quote": "LBC",
    "currencyPair": "BTC_LBC"
  },
  "168": {
    "id": 168,
    "baseID": 28,
    "quoteID": 281,
    "base": "BTC",
    "quote": "STEEM",
    "currencyPair": "BTC_STEEM"
  },
  "169": {
    "id": 169,
    "baseID": 267,
    "quoteID": 281,
    "base": "ETH",
    "quote": "STEEM",
    "currencyPair": "ETH_STEEM"
  },
  "170": {
    "id": 170,
    "baseID": 28,
    "quoteID": 282,
    "base": "BTC",
    "quote": "SBD",
    "currencyPair": "BTC_SBD"
  },
  "171": {
    "id": 171,
    "baseID": 28,
    "quoteID": 283,
    "base": "BTC",
    "quote": "ETC",
    "currencyPair": "BTC_ETC"
  },
  "172": {
    "id": 172,
    "baseID": 267,
    "quoteID": 283,
    "base": "ETH",
    "quote": "ETC",
    "currencyPair": "ETH_ETC"
  },
  "173": {
    "id": 173,
    "baseID": 214,
    "quoteID": 283,
    "base": "USDT",
    "quote": "ETC",
    "currencyPair": "USDT_ETC"
  },
  "174": {
    "id": 174,
    "baseID": 28,
    "quoteID": 284,
    "base": "BTC",
    "quote": "REP",
    "currencyPair": "BTC_REP"
  },
  "175": {
    "id": 175,
    "baseID": 214,
    "quoteID": 284,
    "base": "USDT",
    "quote": "REP",
    "currencyPair": "USDT_REP"
  },
  "176": {
    "id": 176,
    "baseID": 267,
    "quoteID": 284,
    "base": "ETH",
    "quote": "REP",
    "currencyPair": "ETH_REP"
  },
  "177": {
    "id": 177,
    "baseID": 28,
    "quoteID": 285,
    "base": "BTC",
    "quote": "ARDR",
    "currencyPair": "BTC_ARDR"
  },
  "178": {
    "id": 178,
    "baseID": 28,
    "quoteID": 286,
    "base": "BTC",
    "quote": "ZEC",
    "currencyPair": "BTC_ZEC"
  },
  "179": {
    "id": 179,
    "baseID": 267,
    "quoteID": 286,
    "base": "ETH",
    "quote": "ZEC",
    "currencyPair": "ETH_ZEC"
  },
  "180": {
    "id": 180,
    "baseID": 214,
    "quoteID": 286,
    "base": "USDT",
    "quote": "ZEC",
    "currencyPair": "USDT_ZEC"
  },
  "181": {
    "id": 181,
    "baseID": 240,
    "quoteID": 286,
    "base": "XMR",
    "quote": "ZEC",
    "currencyPair": "XMR_ZEC"
  },
  "182": {
    "id": 182,
    "baseID": 28,
    "quoteID": 287,
    "base": "BTC",
    "quote": "STRAT",
    "currencyPair": "BTC_STRAT"
  },
  "184": {
    "id": 184,
    "baseID": 28,
    "quoteID": 289,
    "base": "BTC",
    "quote": "PASC",
    "currencyPair": "BTC_PASC"
  },
  "185": {
    "id": 185,
    "baseID": 28,
    "quoteID": 290,
    "base": "BTC",
    "quote": "GNT",
    "currencyPair": "BTC_GNT"
  },
  "186": {
    "id": 186,
    "baseID": 267,
    "quoteID": 290,
    "base": "ETH",
    "quote": "GNT",
    "currencyPair": "ETH_GNT"
  },
  "189": {
    "id": 189,
    "baseID": 28,
    "quoteID": 292,
    "base": "BTC",
    "quote": "BCH",
    "currencyPair": "BTC_BCH"
  },
  "190": {
    "id": 190,
    "baseID": 267,
    "quoteID": 292,
    "base": "ETH",
    "quote": "BCH",
    "currencyPair": "ETH_BCH"
  },
  "191": {
    "id": 191,
    "baseID": 214,
    "quoteID": 292,
    "base": "USDT",
    "quote": "BCH",
    "currencyPair": "USDT_BCH"
  },
  "192": {
    "id": 192,
    "baseID": 28,
    "quoteID": 293,
    "base": "BTC",
    "quote": "ZRX",
    "currencyPair": "BTC_ZRX"
  },
  "193": {
    "id": 193,
    "baseID": 267,
    "quoteID": 293,
    "base": "ETH",
    "quote": "ZRX",
    "currencyPair": "ETH_ZRX"
  },
  "194": {
    "id": 194,
    "baseID": 28,
    "quoteID": 294,
    "base": "BTC",
    "quote": "CVC",
    "currencyPair": "BTC_CVC"
  },
  "195": {
    "id": 195,
    "baseID": 267,
    "quoteID": 294,
    "base": "ETH",
    "quote": "CVC",
    "currencyPair": "ETH_CVC"
  },
  "196": {
    "id": 196,
    "baseID": 28,
    "quoteID": 295,
    "base": "BTC",
    "quote": "OMG",
    "currencyPair": "BTC_OMG"
  },
  "197": {
    "id": 197,
    "baseID": 267,
    "quoteID": 295,
    "base": "ETH",
    "quote": "OMG",
    "currencyPair": "ETH_OMG"
  },
  "198": {
    "id": 198,
    "baseID": 28,
    "quoteID": 296,
    "base": "BTC",
    "quote": "GAS",
    "currencyPair": "BTC_GAS"
  },
  "199": {
    "id": 199,
    "baseID": 267,
    "quoteID": 296,
    "base": "ETH",
    "quote": "GAS",
    "currencyPair": "ETH_GAS"
  },
  "200": {
    "id": 200,
    "baseID": 28,
    "quoteID": 297,
    "base": "BTC",
    "quote": "STORJ",
    "currencyPair": "BTC_STORJ"
  },
  "201": {
    "id": 201,
    "baseID": 28,
    "quoteID": 298,
    "base": "BTC",
    "quote": "EOS",
    "currencyPair": "BTC_EOS"
  },
  "202": {
    "id": 202,
    "baseID": 267,
    "quoteID": 298,
    "base": "ETH",
    "quote": "EOS",
    "currencyPair": "ETH_EOS"
  },
  "203": {
    "id": 203,
    "baseID": 214,
    "quoteID": 298,
    "base": "USDT",
    "quote": "EOS",
    "currencyPair": "USDT_EOS"
  },
  "204": {
    "id": 204,
    "baseID": 28,
    "quoteID": 300,
    "base": "BTC",
    "quote": "SNT",
    "currencyPair": "BTC_SNT"
  },
  "205": {
    "id": 205,
    "baseID": 267,
    "quoteID": 300,
    "base": "ETH",
    "quote": "SNT",
    "currencyPair": "ETH_SNT"
  },
  "206": {
    "id": 206,
    "baseID": 214,
    "quoteID": 300,
    "base": "USDT",
    "quote": "SNT",
    "currencyPair": "USDT_SNT"
  },
  "207": {
    "id": 207,
    "baseID": 28,
    "quoteID": 301,
    "base": "BTC",
    "quote": "KNC",
    "currencyPair": "BTC_KNC"
  },
  "208": {
    "id": 208,
    "baseID": 267,
    "quoteID": 301,
    "base": "ETH",
    "quote": "KNC",
    "currencyPair": "ETH_KNC"
  },
  "209": {
    "id": 209,
    "baseID": 214,
    "quoteID": 301,
    "base": "USDT",
    "quote": "KNC",
    "currencyPair": "USDT_KNC"
  },
  "210": {
    "id": 210,
    "baseID": 28,
    "quoteID": 302,
    "base": "BTC",
    "quote": "BAT",
    "currencyPair": "BTC_BAT"
  },
  "211": {
    "id": 211,
    "baseID": 267,
    "quoteID": 302,
    "base": "ETH",
    "quote": "BAT",
    "currencyPair": "ETH_BAT"
  },
  "212": {
    "id": 212,
    "baseID": 214,
    "quoteID": 302,
    "base": "USDT",
    "quote": "BAT",
    "currencyPair": "USDT_BAT"
  },
  "213": {
    "id": 213,
    "baseID": 28,
    "quoteID": 303,
    "base": "BTC",
    "quote": "LOOM",
    "currencyPair": "BTC_LOOM"
  },
  "214": {
    "id": 214,
    "baseID": 267,
    "quoteID": 303,
    "base": "ETH",
    "quote": "LOOM",
    "currencyPair": "ETH_LOOM"
  },
  "215": {
    "id": 215,
    "baseID": 214,
    "quoteID": 303,
    "base": "USDT",
    "quote": "LOOM",
    "currencyPair": "USDT_LOOM"
  },
  "216": {
    "id": 216,
    "baseID": 214,
    "quoteID": 59,
    "base": "USDT",
    "quote": "DOGE",
    "currencyPair": "USDT_DOGE"
  },
  "217": {
    "id": 217,
    "baseID": 214,
    "quoteID": 290,
    "base": "USDT",
    "quote": "GNT",
    "currencyPair": "USDT_GNT"
  },
  "218": {
    "id": 218,
    "baseID": 214,
    "quoteID": 278,
    "base": "USDT",
    "quote": "LSK",
    "currencyPair": "USDT_LSK"
  },
  "219": {
    "id": 219,
    "baseID": 214,
    "quoteID": 268,
    "base": "USDT",
    "quote": "SC",
    "currencyPair": "USDT_SC"
  },
  "220": {
    "id": 220,
    "baseID": 214,
    "quoteID": 293,
    "base": "USDT",
    "quote": "ZRX",
    "currencyPair": "USDT_ZRX"
  },
  "221": {
    "id": 221,
    "baseID": 28,
    "quoteID": 304,
    "base": "BTC",
    "quote": "QTUM",
    "currencyPair": "BTC_QTUM"
  },
  "222": {
    "id": 222,
    "baseID": 267,
    "quoteID": 304,
    "base": "ETH",
    "quote": "QTUM",
    "currencyPair": "ETH_QTUM"
  },
  "223": {
    "id": 223,
    "baseID": 214,
    "quoteID": 304,
    "base": "USDT",
    "quote": "QTUM",
    "currencyPair": "USDT_QTUM"
  },
  "224": {
    "id": 224,
    "baseID": 299,
    "quoteID": 28,
    "base": "USDC",
    "quote": "BTC",
    "currencyPair": "USDC_BTC"
  },
  "225": {
    "id": 225,
    "baseID": 299,
    "quoteID": 267,
    "base": "USDC",
    "quote": "ETH",
    "currencyPair": "USDC_ETH"
  },
  "226": {
    "id": 226,
    "baseID": 299,
    "quoteID": 214,
    "base": "USDC",
    "quote": "USDT",
    "currencyPair": "USDC_USDT"
  },
  "229": {
    "id": 229,
    "baseID": 28,
    "quoteID": 306,
    "base": "BTC",
    "quote": "MANA",
    "currencyPair": "BTC_MANA"
  },
  "230": {
    "id": 230,
    "baseID": 267,
    "quoteID": 306,
    "base": "ETH",
    "quote": "MANA",
    "currencyPair": "ETH_MANA"
  },
  "231": {
    "id": 231,
    "baseID": 214,
    "quoteID": 306,
    "base": "USDT",
    "quote": "MANA",
    "currencyPair": "USDT_MANA"
  },
  "232": {
    "id": 232,
    "baseID": 28,
    "quoteID": 305,
    "base": "BTC",
    "quote": "BNT",
    "currencyPair": "BTC_BNT"
  },
  "233": {
    "id": 233,
    "baseID": 267,
    "quoteID": 305,
    "base": "ETH",
    "quote": "BNT",
    "currencyPair": "ETH_BNT"
  },
  "234": {
    "id": 234,
    "baseID": 214,
    "quoteID": 305,
    "base": "USDT",
    "quote": "BNT",
    "currencyPair": "USDT_BNT"
  },
  "235": {
    "id": 235,
    "baseID": 299,
    "quoteID": 292,
    "base": "USDC",
    "quote": "BCH",
    "currencyPair": "USDC_BCH"
  },
  "236": {
    "id": 236,
    "baseID": 28,
    "quoteID": 308,
    "base": "BTC",
    "quote": "BCHABC",
    "currencyPair": "BTC_BCHABC"
  },
  "237": {
    "id": 237,
    "baseID": 299,
    "quoteID": 308,
    "base": "USDC",
    "quote": "BCHABC",
    "currencyPair": "USDC_BCHABC"
  },
  "238": {
    "id": 238,
    "baseID": 28,
    "quoteID": 309,
    "base": "BTC",
    "quote": "BCHSV",
    "currencyPair": "BTC_BCHSV"
  },
  "239": {
    "id": 239,
    "baseID": 299,
    "quoteID": 309,
    "base": "USDC",
    "quote": "BCHSV",
    "currencyPair": "USDC_BCHSV"
  },
  "240": {
    "id": 240,
    "baseID": 299,
    "quoteID": 243,
    "base": "USDC",
    "quote": "XRP",
    "currencyPair": "USDC_XRP"
  },
  "241": {
    "id": 241,
    "baseID": 299,
    "quoteID": 240,
    "base": "USDC",
    "quote": "XMR",
    "currencyPair": "USDC_XMR"
  },
  "242": {
    "id": 242,
    "baseID": 299,
    "quoteID": 198,
    "base": "USDC",
    "quote": "STR",
    "currencyPair": "USDC_STR"
  },
  "243": {
    "id": 243,
    "baseID": 299,
    "quoteID": 59,
    "base": "USDC",
    "quote": "DOGE",
    "currencyPair": "USDC_DOGE"
  },
  "244": {
    "id": 244,
    "baseID": 299,
    "quoteID": 125,
    "base": "USDC",
    "quote": "LTC",
    "currencyPair": "USDC_LTC"
  },
  "245": {
    "id": 245,
    "baseID": 299,
    "quoteID": 286,
    "base": "USDC",
    "quote": "ZEC",
    "currencyPair": "USDC_ZEC"
  },
  "246": {
    "id": 246,
    "baseID": 28,
    "quoteID": 307,
    "base": "BTC",
    "quote": "FOAM",
    "currencyPair": "BTC_FOAM"
  },
  "247": {
    "id": 247,
    "baseID": 299,
    "quoteID": 307,
    "base": "USDC",
    "quote": "FOAM",
    "currencyPair": "USDC_FOAM"
  },
  "248": {
    "id": 248,
    "baseID": 28,
    "quoteID": 310,
    "base": "BTC",
    "quote": "NMR",
    "currencyPair": "BTC_NMR"
  },
  "249": {
    "id": 249,
    "baseID": 28,
    "quoteID": 311,
    "base": "BTC",
    "quote": "POLY",
    "currencyPair": "BTC_POLY"
  },
  "250": {
    "id": 250,
    "baseID": 28,
    "quoteID": 312,
    "base": "BTC",
    "quote": "LPT",
    "currencyPair": "BTC_LPT"
  },
  "251": {
    "id": 251,
    "baseID": 28,
    "quoteID": 314,
    "base": "BTC",
    "quote": "GRIN",
    "currencyPair": "BTC_GRIN"
  },
  "252": {
    "id": 252,
    "baseID": 299,
    "quoteID": 314,
    "base": "USDC",
    "quote": "GRIN",
    "currencyPair": "USDC_GRIN"
  }
}
