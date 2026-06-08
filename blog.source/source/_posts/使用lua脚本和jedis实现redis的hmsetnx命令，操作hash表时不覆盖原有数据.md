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
redis中set系列命令(包括set,hset等等)，基本上都包括两个版本，纯粹的set和setnx, setnx即set not exist, 也就是只有Key不存在时才会执行set, 而不会覆盖原有的值。

但是hmset这个命令，包括redis本身，jedis都没有提供nx版本的支持。当然，hset这个命令是有对应的hsetnx版本的，hmset意思就是multi hset,一次可以操作多个key, 从而减小网络开销。

所以，为了在使用hmset时也能降低网络的消耗，用lua写了一个脚本，实现hmsetnx的效果，即：向Hash表中set键值对时，只有键不存在时才会写入，不会覆盖原有值。

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

脚本的原理还是比较简单，脚本中使用的参数和hmset完全一致。依次读入参数列表，迭代器i是奇数时给key赋值，偶数时执行一次hsetnx,循环结束后也就完成了。

之后再调用jedis封装好的eval接口，

Object eval(final String script, final List<String> keys, final List<String> args)

或者

Object eval(final byte[] script, final List<byte[]> keys, final List<byte[]> args）

都可以，这两个接口的区别就是是否对参数进行序列化

keys中只放一个元素，就是hash表本身的key, 然后把键值对按照一个key,一个value的顺序依次放到args里。

当然，也可以用evalsha命令避免每次操作都要传输脚本本身，这里就不细说了。
---
