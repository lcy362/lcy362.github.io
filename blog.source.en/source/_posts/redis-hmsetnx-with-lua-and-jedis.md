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
  - Database
tags:
  - redis
  - lua
abbrlink: 63756
tldr: "Batch initializes Hash fields without overwriting existing data, completing the task in a single network round-trip instead of multiple HSETNX calls."
cover: /img/63756.jpg
date: 2017-04-06 17:54:00
---
In Redis's Hash operations, `HSETNX` ensures that a field is only written when it does not already exist. However, `HMSET` (which sets multiple fields in batch) has no corresponding `HMSETNX` command. If you need to batch-initialize a cache without overwriting existing data, issuing N `HSETNX` commands would require N network round-trips — terrible performance in batch scenarios.

This can be solved elegantly with a Lua script — pushing the logic to the Redis server side and requiring only a single network round-trip.

<!-- more -->

## Problem Background

Imagine a user configuration caching scenario: when a new user accesses the system for the first time, a set of default configurations needs to be initialized in a Redis Hash. However, if the user already has some configurations, those should not be overwritten.

Using `HSETNX` one by one would certainly work, but if there are 20 configuration items, that means 20 Redis round-trips. Under high concurrency, this becomes a bottleneck.

`HMSET` can set multiple fields at once, but it **unconditionally overwrites** existing values — which doesn't meet the requirement.

## Lua Script Solution

```lua
local key
for i, j in ipairs(ARGV)
do
    if i % 2 == 0 then
        redis.call('hsetnx', KEYS[1], key, j)
    else
        key = j
    end
end
return 1
```

**Script Logic**:

The `ARGV` format is identical to `HMSET`: `[field1, value1, field2, value2, ...]`. The script iterates through the parameter list — odd positions (1, 3, 5...) are stored as `key`, while even positions (2, 4, 6...) trigger an `HSETNX` call.

Since Redis executes Lua scripts atomically, the entire process cannot be interrupted by other commands.

## Java Invocation (Jedis)

```java
// Script string (can be stored in a constant)
String HMSETNX_SCRIPT = 
    "local key\n" +
    "for i, j in ipairs(ARGV)\n" +
    "do\n" +
    "    if i % 2 == 0 then\n" +
    "        redis.call('hsetnx', KEYS[1], key, j)\n" +
    "    else\n" +
    "        key = j\n" +
    "    end\n" +
    "end\n" +
    "return 1";

// Invocation
Jedis jedis = new Jedis("localhost", 6379);
List<String> keys = Collections.singletonList("user:config:1001");
List<String> args = Arrays.asList("theme", "dark", "lang", "zh", "timezone", "UTC+8");

jedis.eval(HMSETNX_SCRIPT, keys, args);
```

**Parameter Explanation**:

- `keys`: Contains only one element — the key of the Hash table itself
- `args`: Arranged in `field1, value1, field2, value2...` order
- `eval()` has two overloads: `String` version and `byte[]` version — the difference is whether parameters need serialization

## Performance Optimization: EVALSHA

Every `EVAL` call transmits the full script content. For fixed scripts, `EVALSHA` can significantly reduce network overhead:

```java
// Compute the script's SHA1
String sha = jedis.scriptLoad(HMSETNX_SCRIPT);

// Subsequent calls use the SHA1 directly
jedis.evalsha(sha, keys, args);
```

`EVALSHA` only transmits a few dozen bytes (the SHA1 value). The script itself is only transmitted once during the initial `SCRIPT LOAD`.

## Hmsetnx vs Per-field Hsetnx: Performance Comparison

| Approach | Network Round-trips | Atomicity | Complexity |
|----------|--------------------|-----------|------------|
| Per-field `HSETNX` | N | No (non-transactional) | Lowest |
| Lua script `EVAL` | 1 | Yes (Lua atomic execution) | Medium |
| Lua script `EVALSHA` | 1 | Yes | Medium |

For a scenario with 20 fields, the Lua approach eliminates 19 network round-trips — the effect is dramatic under high concurrency.

## Notes

- **Cluster Mode**: If Redis is deployed in Cluster mode, ensure `KEYS[1]` (the Hash key) falls in the same slot. Use hash tags to guarantee this (e.g., `{user:1001}:config`)
- **Big Key**: If the Hash contains a huge number of fields, `HSETNX` itself is O(1) per operation, but be mindful of the total key size
- **Script Length**: Redis enforces a time limit on Lua script execution (`lua-time-limit`), but this script just loops through O(n) `HSETNX` calls and won't trigger a timeout
---
Source: https://lichuanyang.top/en/posts/63756/

---
