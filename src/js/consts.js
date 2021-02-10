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
  "8": {
    "id": 8,
    "baseID": 28,
    "quoteID": 20,
    "base": "BTC",
    "quote": "BELA",
    "currencyPair": "BTC_BELA"
  },
  "10": {
    "id": 10,
    "baseID": 28,
    "quoteID": 22,
    "base": "BTC",
    "quote": "BLK",
    "currencyPair": "BTC_BLK"
  },
  "12": {
    "id": 12,
    "baseID": 28,
    "quoteID": 29,
    "base": "BTC",
    "quote": "BTCD",
    "currencyPair": "BTC_BTCD"
  },
  "13": {
    "id": 13,
    "baseID": 28,
    "quoteID": 31,
    "base": "BTC",
    "quote": "BTM",
    "currencyPair": "BTC_BTM"
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
  "28": {
    "id": 28,
    "baseID": 28,
    "quoteID": 69,
    "base": "BTC",
    "quote": "EMC2",
    "currencyPair": "BTC_EMC2"
  },
  "31": {
    "id": 31,
    "baseID": 28,
    "quoteID": 78,
    "base": "BTC",
    "quote": "FLDC",
    "currencyPair": "BTC_FLDC"
  },
  "32": {
    "id": 32,
    "baseID": 28,
    "quoteID": 254,
    "base": "BTC",
    "quote": "FLO",
    "currencyPair": "BTC_FLO"
  },
  "38": {
    "id": 38,
    "baseID": 28,
    "quoteID": 93,
    "base": "BTC",
    "quote": "GAME",
    "currencyPair": "BTC_GAME"
  },
  "40": {
    "id": 40,
    "baseID": 28,
    "quoteID": 261,
    "base": "BTC",
    "quote": "GRC",
    "currencyPair": "BTC_GRC"
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
  "63": {
    "id": 63,
    "baseID": 28,
    "quoteID": 153,
    "base": "BTC",
    "quote": "NEOS",
    "currencyPair": "BTC_NEOS"
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
  "73": {
    "id": 73,
    "baseID": 28,
    "quoteID": 168,
    "base": "BTC",
    "quote": "PINK",
    "currencyPair": "BTC_PINK"
  },
  "74": {
    "id": 74,
    "baseID": 28,
    "quoteID": 171,
    "base": "BTC",
    "quote": "POT",
    "currencyPair": "BTC_POT"
  },
  "75": {
    "id": 75,
    "baseID": 28,
    "quoteID": 172,
    "base": "BTC",
    "quote": "PPC",
    "currencyPair": "BTC_PPC"
  },
  "83": {
    "id": 83,
    "baseID": 28,
    "quoteID": 183,
    "base": "BTC",
    "quote": "RIC",
    "currencyPair": "BTC_RIC"
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
  "98": {
    "id": 98,
    "baseID": 28,
    "quoteID": 253,
    "base": "BTC",
    "quote": "XVC",
    "currencyPair": "BTC_XVC"
  },
  "99": {
    "id": 99,
    "baseID": 28,
    "quoteID": 220,
    "base": "BTC",
    "quote": "VRC",
    "currencyPair": "BTC_VRC"
  },
  "100": {
    "id": 100,
    "baseID": 28,
    "quoteID": 221,
    "base": "BTC",
    "quote": "VTC",
    "currencyPair": "BTC_VTC"
  },
  "104": {
    "id": 104,
    "baseID": 28,
    "quoteID": 229,
    "base": "BTC",
    "quote": "XBC",
    "currencyPair": "BTC_XBC"
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
  "130": {
    "id": 130,
    "baseID": 240,
    "quoteID": 22,
    "base": "XMR",
    "quote": "BLK",
    "currencyPair": "XMR_BLK"
  },
  "131": {
    "id": 131,
    "baseID": 240,
    "quoteID": 29,
    "base": "XMR",
    "quote": "BTCD",
    "currencyPair": "XMR_BTCD"
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
  "151": {
    "id": 151,
    "baseID": 28,
    "quoteID": 269,
    "base": "BTC",
    "quote": "BCY",
    "currencyPair": "BTC_BCY"
  },
  "153": {
    "id": 153,
    "baseID": 28,
    "quoteID": 270,
    "base": "BTC",
    "quote": "EXP",
    "currencyPair": "BTC_EXP"
  },
  "155": {
    "id": 155,
    "baseID": 28,
    "quoteID": 271,
    "base": "BTC",
    "quote": "FCT",
    "currencyPair": "BTC_FCT"
  },
  "158": {
    "id": 158,
    "baseID": 28,
    "quoteID": 274,
    "base": "BTC",
    "quote": "RADS",
    "currencyPair": "BTC_RADS"
  },
  "160": {
    "id": 160,
    "baseID": 28,
    "quoteID": 275,
    "base": "BTC",
    "quote": "AMP",
    "currencyPair": "BTC_AMP"
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
  "183": {
    "id": 183,
    "baseID": 28,
    "quoteID": 288,
    "base": "BTC",
    "quote": "NXC",
    "currencyPair": "BTC_NXC"
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
  "187": {
    "id": 187,
    "baseID": 28,
    "quoteID": 291,
    "base": "BTC",
    "quote": "GNO",
    "currencyPair": "BTC_GNO"
  },
  "188": {
    "id": 188,
    "baseID": 267,
    "quoteID": 291,
    "base": "ETH",
    "quote": "GNO",
    "currencyPair": "ETH_GNO"
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
  }
}
