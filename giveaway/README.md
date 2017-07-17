# Poloniex Ninja Giveaway

## I'm giving away 0.02 BTC to 15 of my followers using Poloniex Ninja!

## The rules

* You're using [Poloniex Ninja](https://bit.ly/polo-ninja) and you like it (soft requirement)
* You are a twitter user since at least June 2017
* You're [my Twitter](https://twitter.com/codesonzh) follower (or have just become one)
* All tweets (one tweet per twitter user) with below contents posted until and including 30th July 2017 23:59 GMT are eligible
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
