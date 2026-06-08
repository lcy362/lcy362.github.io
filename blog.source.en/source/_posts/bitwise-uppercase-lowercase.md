---
title: "Converting Between Uppercase and Lowercase Using Bitwise Operations"
description: "Leveraging bitwise operations to elegantly convert between uppercase and lowercase letters, with a deep dive into the binary characteristics of ASCII codes."
keywords:
  - bitwise-operations
  - ascii
  - case conversion
  - algorithm
categories:
  - Java
tags:
  - bitwise-operations
abbrlink: 9193
cover: /img/9193.jpg
date: 2018-11-14 21:58:47
---
Bitwise operations are a widely used computation method in computer science. When used appropriately, they can greatly improve computational efficiency. Today, I'd like to introduce a clever application of bitwise operations: converting between uppercase and lowercase letters.

<!-- more -->

To tackle this problem, we can first examine the ASCII code characteristics of uppercase and lowercase letters.

![](/img/letter_ascii.png)

As we can see, the ASCII code values of each pair of uppercase and lowercase letters differ by 32. In binary, this means only the sixth bit is flipped while all other bits remain the same.

Therefore, by XORing a letter's value with `0010 0000` (32), we can obtain its corresponding uppercase or lowercase letter.

Source: https://lichuanyang.top/en/posts/9193/
