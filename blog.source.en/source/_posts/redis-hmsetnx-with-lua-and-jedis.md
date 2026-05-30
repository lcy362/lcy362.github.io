---
title: Implementing Redis hmsetnx Command Using Lua Scripts and Jedis
description: "Implementing Redis's missing hmsetnx command with Lua scripts and Jedis, to avoid overwriting existing data when batch operating on Hash tables."
keywords:
  - Redis
  - Lua script
  - Jedis
  - hmsetnx
  - Hash
categories:
  - database
tags:
  - redis
  - lua
abbrlink: 63756
date: 2017-04-06 17:54:00
---
The set family of commands in Redis (including set, hset, etc.) basically have two versions: pure set and setnx. Setnx means "set not exist", which only executes the set operation when the key does not exist, without overwriting the existing value.

However, for the hmset command, neither Redis itself nor Jedis provides an nx version. Of course, the hset command has a corresponding hsetnx version. Hmset means "multi hset" — it can operate on multiple key-value pairs at once, thereby reducing network overhead.

So, in order to also reduce network consumption when using hmset, I wrote a Lua script to achieve the hmsetnx effect: when setting key-value pairs in a Hash table, values are only written when the key does not exist, without overwriting existing values.

```
local key
for i,j in ipairs(ARGV)
do	if i%2 == 0
	then
		redis.call('hsetnx', KEYS[1], key,j)
	else
		key = j
	end
end
return 1
```

The principle of the script is quite simple. The parameters used in the script are identical to hmset. It reads the parameter list sequentially — when the iterator i is odd, it assigns the key; when it's even, it executes an hsetnx. The loop completes when all parameters have been processed.

Then call Jedis's wrapped eval interface:

Object eval(final String script, final List<String> keys, final List<String> args)

or

Object eval(final byte[] script, final List<byte[]> keys, final List<byte[]> args)

Both work. The difference between these two interfaces is whether the parameters are serialized.

In keys, only one element is placed — the key of the Hash table itself. Then the key-value pairs are placed sequentially in args in the order of one key, one value.

Of course, you can also use the evalsha command to avoid transmitting the script itself with every operation. I won't go into details here.
---
Source: https://lichuanyang.top/en/posts/63756/

---
