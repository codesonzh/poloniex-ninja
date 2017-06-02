# Poloniex™ Ninja

Poloniex™ Ninja is a Chrome extension which provides simple tools and utilities
which are otherwise unavailable on the Poloniex™ website during trading and
auditing.

The tools aim to improve decision making by reducing the time needed for hand
calculations usually done using external tools. Please read the disclaimer below
before using this software.

Get the [**Poloniex Ninja™ Chrome extension**](http://bit.ly/polo-ninja-gh).

## Donations

Consider donating 0.002 BTC or more to this address:

```
1BjJdkoRvhtVkHGm4Fs7pZu4rmk2eYEkd6
```

Thanks for supporting development of Poloniex™ Ninja!

## Features

**The tool is being developed. Balance extensions are currently supported.**

The added balance columns are as follows:

* **AVG Buy Price** - the average weighted buy price which justifies the current
  balance of the coin (we consider the transaction history backwards up to the
  point where the net balance was 0) - this will match your trade history
  analysis only if you follow the same algorithm
* **AVG Buy Value** - the estimated buy value of the current balance (Balance *
  AVG Buy Price)
* **Change** - The growth comparing the current BTC Value against AVG Buy Value,
  this indicator tells you if you're currently losing or gaining money
* **USD Value** - Estimated value of the coin in USDT (BTC converted to USD)

**Notice!**

AVG Buy Price, AVG Buy Value and Change columns only consider BTC transactions
against an altcoin other than USDT. This means that for example ETH and XMR
exchanges for other altcoins are not taken into account (the Change column may
be incorrect as well as the AVG columns).

![Balance columns](https://github.com/codesonzh/poloniex-ninja/blob/master/docs/balances.png?raw=true)


## Privacy

Poloniex™ Ninja does not collect any information about the user, prices,
balances or other information or meta data associated while using the extension.
All computation is done on the client, however some data may be requested using
the fetch or XHR API exclusively from the Poloniex™ server (only GET requests)
in order to provide more context and to be up to date.

Since the source code is available and the extension is only requesting access
to poloniex.com, no data is being collected and the program only operates in the
browser.


## Disclaimer

This software comes with no warranty whatsoever. Any issue, damage or material
loss occurred during the use of the software will not be reimbursed, repaired or
otherwise acted upon from the authors. If you're using this software, you're
willfully accepting the risk of a failure due to a bug, unexpected change of
the Poloniex™ software or any other factor. Please review the LICENSE file for
more details. The license is available at
https://github.com/codesonzh/poloniex-ninja/blob/master/LICENSE .

The extension is built for research, exploratory and testing purposes without
collecting any data from Poloniex™, without affecting other users and with a
very low impact on the service itself (only GET requests counting well below API
rate limits), please be mindful when installing extensions and make sure to
review the terms and conditions of Poloniex™ before using this or other similar
software.

The extension is only doing what any user with a browser and a developer console
can achieve and does not use any exploits to achieve advantage as a trader. The
only edge gained is less time doing side calculations using external tools and
less probability of doing a mistake given all works as intended.

The software reads available data for which the user gives permission and which
the user itself can access and modifies parts of pages which are clearly visible
as the extension side-effect. The extension will never try to post any data
instead of the user nor prevent a user from performing an action. Modifications
on the pages are only readable, non-actionable and done on the DOM level. No
existing code of the website is ever getting modified or interfered with as this
is built as a layer on top of the existing program (only in-memory DOM changes
are applied). All computation is done in the browser tab and never leaves it's
execution context (which is also achievable using the developer console).

