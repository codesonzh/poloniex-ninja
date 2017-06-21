// from consts.js import MARKETS_BY_ID

// Export all returned methods to global object WS.
var WS = (function() {

// Configuration.
var WS_CONFIG = {
  'ENDPOINT_URL': 'wss://api2.poloniex.com',
  'SHORT_RESTART_PERIOD_MS': 250,
  'LONG_RESTART_PERIOD_MS': 2000,
  'CONNECTION_PERSIST_INTERVAL_MS': 60000
};

// Websocket events.
var WS_EVENT = {
  // Event of a curency price change.
  'TICKER_EVENT': 1002,
};

// Websocket remote commands.
var WS_COMMAND = {
  'SUBSCRIBE': 'subscribe',
  'UNSUBSCRIBE': 'unsubscribe',
  'HEARTBEAT': '.'
}

// Default state of the websocket.
var DEFAULT_WS_STATE = {
  // The current connection id.
  connectionId: 0,
  // The current connection object with subscriptions and other details.
  conn: null
};

// Current state of the websocket.
var wsState = jQuery.extend(true, {}, DEFAULT_WS_STATE);

// Unsubscribes provided conn from the named channel.
function unsubscribe(channel, conn) {
  if (conn.readyState == 1) {
    conn.send(JSON.stringify({command: WS_COMMAND.unsubscribe,
                              channel: channel}));

    if ('subscriptions' in conn)
      delete conn.subscriptions[channel];
  }
}

// Unsubscribes from all currently subscribed channels.
function clearSubscriptions() {
  if (wsState.conn && wsState.conn.readyState != 0)
    for (var channel in wsState.conn.subscriptions)
      unsubscribe(channel, wsState.conn);
}

// Subscribes provided conn to a named channel.
function subscribe(channel, conn) {
  if (conn.readyState == 1) {
    conn.send(JSON.stringify({command: WS_COMMAND.SUBSCRIBE,
                              channel: channel}));
  }
}

// Closes the connection and restarts the web socket.
function resetWebsocket(handler) {
  if (wsState.conn)
    return wsState.conn.close();

  setupWebsocket(handler);
}

// Unsubcribes from all events and closes the websocket.
function teardownWebsocket() {
  if (!wsState.conn)
    return;

  clearSubscriptions();
  wsState.conn.close();
  clearInterval(wsState.conn.persistConnection);
  wsState = jQuery.extend(true, {}, DEFAULT_WS_STATE);
}

// Parses a ticker event into a more managable format.
function parseTickerEvent(args) {
  return {pair: args[0],
          last: args[1],
          lowestAsk: args[2],
          highestBid: args[3],
          percentChange: args[4],
          baseVolume: args[5],
          quoteVolume: args[6],
          isFrozen: args[7],
          high24hr: args[8],
          low24hr: args[9]};
}

// Sets up the websocket and binds the provided event handlers.
// E.g.
// handler.ticker = function(parsedTickerEvent) {}
function setupWebsocket(handler) {
  // Dissallow multiple attempts to setup a websocket or empty handlers.
  if (wsState.conn || !handler)
    return;

  wsState.conn = new WebSocket(WS_CONFIG.ENDPOINT_URL);
  wsState.conn.subscriptions = {};

  wsState.conn.onopen = function(e) {
    wsState.conn.connectionID = ++wsState.connectionId;
    subscribe(WS_EVENT.TICKER_EVENT, e.target);

    // TODO: Check if this even works given setInterval and Chrome extensions.
    wsState.conn.persistConnection = setInterval(function() {
      try {
        wsState.conn.send(WS_COMMAND.HEARTBEAT);
      } catch (err) {
        resetWebsocket(handler);
      }
    }, WS_CONFIG.CONNECTION_PERSIST_INTERVAL_MS);
  }

  wsState.conn.onclose = function(e) {
    if (typeof e == "object" && 'persistConnection' in e.target){
      clearInterval(e.target.persistConnection);

      if (e.target.connectionID != wsState.connectionId)
        return true;

      if (e.target.readyState == 1)
        return e.target.close();
    }

    clearSubscriptions();
    wsState.conn.subscriptions = {};

    var period = (e === true) ? WS_CONFIG.SHORT_RESTART_PERIOD_MS :
                                WS_CONFIG.LONG_RESTART_PERIOD_MS;
    setTimeout(function() {
      setupWebsocket(handler);
    }, period);
  }

  wsState.conn.onerror = function(e) {
    if (e.target.connectionID != wsState.connectionId)
      return e.target.close();

    clearSubscriptions();
  }

  // Set up the main handler for all websocket messages.
  wsState.conn.onmessage = function(e) {
    if (e.target.connectionID != wsState.connectionId)
      return e.target.close();

    if (e.data.length == 0)
      return;

    var msg = JSON.parse(e.data);

    if ('error' in msg)
      return console.error("PoloNinja: websocket error", msg);

    if (msg[1] == 1)
      return e.target.subscriptions[msg[0]] = true;

    if (msg[1] === 0)
      return delete e.target.subscriptions[msg[0]];

    var eventType = msg[0];

    if (eventType == WS_EVENT.TICKER_EVENT && ('ticker' in handler)) {
      // Find the currency pair from ID and replace the ID with the token name.
      msg[2][0] = MARKETS_BY_ID[msg[2][0]].currencyPair;
      handler.ticker(parseTickerEvent(msg[2]));
    }
  }
}

// Export methods.
return {'setupWebsocket': setupWebsocket,
        'teardownWebsocket': teardownWebsocket};
})();
