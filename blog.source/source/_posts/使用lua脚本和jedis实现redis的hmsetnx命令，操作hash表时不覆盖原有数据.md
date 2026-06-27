---
title: 使用lua脚本和jedis实现redis的hmsetnx命令，操作hash表时不覆盖原有数据
description: "用 Lua 脚本和 Jedis 实现 Redis 缺失的 hmsetnx 命令，在批量操作 Hash 时不覆盖已有数据。"
keywords:
  - Redis
  - Lua脚本
  - Jedis
  - hmsetnx
  - Hash
categories:
  - 数据库
tags:
  - redis
  - lua
abbrlink: 63756
cover: /img/63756.jpg
date: 2017-04-06 17:54:00
---
Redis 的 Hash 操作中，`HSETNX` 可以保证只在 field 不存在时才写入，但 `HMSET`（批量设置多个 field）却没有对应的 `HMSETNX` 命令。如果你需要批量初始化缓存且不覆盖已有数据，每次发 N 个 `HSETNX` 命令会产生 N 次网络往返，这在批量场景下性能很差。

用 Lua 脚本可以完美解决这个问题——把逻辑放到 Redis 服务端执行，只需要一次网络往返。

<!-- more -->

## 问题背景

假设你有一个用户配置的缓存场景：新用户首次访问时，需要初始化一组默认配置到 Redis Hash 中。但如果用户已经有了部分配置，不应该覆盖。

用 `HSETNX` 逐个设置当然可以，但如果有 20 个配置项，就是 20 次 Redis 往返。在高并发下，这会成为瓶颈。

而 `HMSET` 一次可以设多个 field，但它会**无条件覆盖**已有值——这不符合需求。

## Lua 脚本方案

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

**脚本逻辑**：

`ARGV` 的参数格式与 `HMSET` 完全一致：`[field1, value1, field2, value2, ...]`。脚本遍历参数列表，奇数位置（1, 3, 5...）存为 `key`，偶数位置（2, 4, 6...）执行一次 `HSETNX`。

由于 Redis 执行 Lua 脚本是原子的，整个过程不会被其他命令打断。

## Java 调用（Jedis）

```java
// 脚本字符串（可以放在常量中）
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

// 调用
Jedis jedis = new Jedis("localhost", 6379);
List<String> keys = Collections.singletonList("user:config:1001");
List<String> args = Arrays.asList("theme", "dark", "lang", "zh", "timezone", "UTC+8");

jedis.eval(HMSETNX_SCRIPT, keys, args);
```

**参数说明**：

- `keys`：只放一个元素——Hash 表本身的 key
- `args`：按 `field1, value1, field2, value2...` 的顺序排列
- `eval()` 的两个重载：`String` 版本和 `byte[]` 版本，区别是是否需要序列化参数

## 性能优化：EVALSHA

每次 `EVAL` 都需要传输完整的脚本内容。对于固定脚本，用 `EVALSHA` 可以大幅减少网络开销：

```java
// 计算脚本的 SHA1
String sha = jedis.scriptLoad(HMSETNX_SCRIPT);

// 后续调用直接使用 SHA1
jedis.evalsha(sha, keys, args);
```

`EVALSHA` 只传输几十字节的 SHA1 值，脚本只在首次 `SCRIPT LOAD` 时传输一次。

## Hmsetnx vs 逐条 Hsetnx：性能对比

| 方案 | 网络往返 | 原子性 | 复杂度 |
|------|---------|--------|--------|
| 逐条 `HSETNX` | N 次 | 否（非事务） | 最低 |
| Lua 脚本 `EVAL` | 1 次 | 是（Lua 原子执行） | 中 |
| Lua 脚本 `EVALSHA` | 1 次 | 是 | 中 |

对于 20 个 field 的场景，Lua 方案可以减少 19 次网络往返，在高并发下效果非常显著。

## 注意事项

- **Cluster 模式**：如果 Redis 是 Cluster 模式，需要确保 `KEYS[1]`（Hash 的 key）落在同一个 slot。可以用 hash tag 来保证（如 `{user:1001}:config`）
- **Big Key**：如果 Hash 中 field 数量巨大，`HSETNX` 本身时间复杂度是 O(1)，但要注意总 key 大小
- **脚本长度**：Redis 对 Lua 脚本的执行有时间限制（`lua-time-limit`），但这里只是循环执行 O(n) 个 `HSETNX`，不会触发超时
---
