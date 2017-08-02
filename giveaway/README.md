# Poloniex Ninja Giveaway

## I'm giving away 0.02 BTC to 15 of my followers using Poloniex Ninja!

## The rules

* You're using [Poloniex Ninja](https://bit.ly/polo-ninja) and you like it (soft requirement)
* You are a twitter user since at least July 2017
* You're [my Twitter](https://twitter.com/codesonzh) follower (or have just become one)
* All tweets (one tweet per twitter user) with below contents posted until and including 1st September 2017 23:59 GMT are eligible
* Prize distribution and winner selection algorithm is described below
* **You have to retweet the [annoncement](https://twitter.com/codesonzh/status/885617425823272960) of the giveaway so we gather enough candidates** - if you tweeted before 16th July, this is not a requirement
* You have to post a tweet with contents of my [example tweet](https://twitter.com/codesonzh/status/885607860557709313) replaced with your BTC address:

```
I use Poloniex like a Ninja!
#PoloNinja #LevelOver9000 #btc #exchange @codesonzh
bit.ly/polo-ninja
<Your BTC address>
```

**If there are not at least 15 unique addresses by the deadline, the giveaway deadline is extended and I'll update this document with a concrete date.**

## Prize distribution

* 1 follower gets 0.005 BTC
* 4 followers get 0.0025 BTC each
* 10 followers get 0.0005 BTC each

## Winner selection

To make this fair and not entirely random, I'll describe the algorithm
for the winner selection which you can easily reproduce after the deadline.

All eligible tweets are to be collected day or two after the deadline.

* I take all the unique eligible BTC addresses and sort them lexicographically in ascending order
* I take the hash of the very last confirmed Bitcoin block on the day of the deadline.
* I take the last 8 hex digits of the hash and convert it to decimal (integer)
* The integer is used as the seed in the python random.seed method
* All of the unique eligible addresses are then shuffled with python's random.shuffle
* First 15 addresses are selected and the prize is sent out as described by the distribution

I'll be using python 2.7.12 on a Windows 10 64-bit machine. I will most likely
use the twitter search API with the following query to collect the addresses:

```
"I use Poloniex like a Ninja!" #PoloNinja #LevelOver9000 #btc @codesonzh
```

I will then filter out the results by checking that all of the parts are
present and that all the rules have been followed.

See [the code](https://github.com/codesonzh/poloniex-ninja/blob/master/giveaway/giveaway.py) for this algorithm. I'll be using the same script, except for
filling in the last block hash and eligible addresses.


## Current eligible addresses

Last update: 2nd August 2017

If you're not on this list it's probably because I haven't updated, but you're
welcome to create a pull request (it must link to your tweet), also, raise an
issue if there's a typo or you think you should be here.

* @TraderTravis 1HtGkVA4WdK4GgBq28UXL68zywxG65ZQ8E [tweet](https://twitter.com/trader_travis/status/885651289182322688)
* @DuncanWierman 1B7CdmVo924P6VooceZzfaVSHbs22A7BWJ [tweet](https://twitter.com/DuncanWierman/status/885730942505041920)
* @konradburnik 1MAye4Z1AxAfH1e2GVpTw99fpqgJcvkqJ6 [tweet](https://twitter.com/konradburnik/status/887060048207368192)
* @soni_anirudh 1K4oo5xSMZ32EkrWP5Er2GnrvUR4hg9r9S [tweet](https://twitter.com/soni_anirudh/status/888814287963160576)
* @RichAlexey 1PZKbnQEJRajPDMRAUnrtgTWpKvkf3wiXg [tweet](https://twitter.com/RichAlexey/status/889379906358054912)
* @Nahiynus 1EhqmabsGUc5dUDqvroiSPvJRnfaDLjCks [tweet](https://twitter.com/Nahiynus/status/892229764014002176)
* @Andy_vega 1EgWj9degJnpekDeJ1ZHX5t4BBmJwkKku [tweet](https://twitter.com/Andy_vega/status/892693150325760001)
