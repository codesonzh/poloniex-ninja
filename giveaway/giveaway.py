import random


def proclaim_winners(block_hash, addrs):
  # Take unique addresses and sort them.
  addrs = list(sorted(list(set(addrs))))
  # Pull out the seed from the bitcoin block signature.
  seed = int(block_hash[-8:], 16)
  # Initialize randomizer with seed.
  random.seed(seed)

  # The actual prize distribution.
  prize_distribution = [
      (1, 0.005),
      (4, 0.0025),
      (10, 0.0005)]

  # Reorder the sorted addresses using the hash seed.
  random.shuffle(addrs)

  # Print out the winners in order.
  tier = 1
  winner_index = 1
  for (num_winners, prize_amount) in prize_distribution:
    print "Tier %s winners:" % tier
    for i in range(num_winners):
      # The prize distribution dictates how many winners.
      if len(addrs) == 0:
        return
      winner_addr = addrs.pop(0)
      print " %2d) Send %lf BTC to address %s" % \
          (winner_index, prize_amount, winner_addr)
      winner_index += 1
    print ""
    tier += 1


if __name__ == "__main__":
  # Only as example. This hash will be filled in after the deadline.
  block_hash = (
      "000000000000000000261f19fdab85b4120c371beb929e1f373763cb02009b61")

  # Only as example. Addresses will be listed after day of the deadline.
  addrs = [
      '14tpYSMjZLL34ZfJASUr727DkVUFmAFw6n',
      '14ZQ3YeS8jRm5RhsfVU9mticxW13qNdyMR',
      '16H1wB1S6PeAizTtn736G9sRXNXxnEfAiF',
      '179TFp8ZjnFJEBjyrb1iEkAcDjpymKc3WW',
      '18vp7LZPBmUUeTTTUJMhDyAyvYy7L2xS3w',
      '194UuXgweBbrGh5JWMMDgcACrZBG4coJ2w',
      '199Ysqo72oCjS9RrUopz2awh4uCVcSkvqk',
      '19Dmfv2ee9UuS8kznmw49gBXgpS8Dvpp6b',
      '19VLoDjuh3sf3t983ML1RqmLS1QkXSJGwc',
      '1Abob6wik9GzUWnmPS8Lpc5QLNqd2imEZi',
      '1BefHfcGKNFDDAV3pULsyZq8iauDwLTUQT',
      '1Esvw5Hjrc2AFoB77qcebhJyFHvmfG92Yx',
      '1GGWjJcz2qsStARqXEt4rtp6AoV4muvdVG',
      '1LxfWgaZSp4Pp9tEqJJFU7oXPjFfqKHDoo',
      '1N6d3TPUC5HsdEDgxqpYY8WSRsLyvMte9g',
      '1NDUBiY8omCR8DxNwRoszzo6NYzizGXGC3',
      '1NoT9sBTHeRvuYjRodbpvhrsLniNmxUvus']

  proclaim_winners(block_hash, addrs)
