---
title: iterm2配置ssh书签, 实现记住密码和自动登录
description: "通过 iTerm2 配置 SSH 书签，实现记住密码和自动登录，告别反复输入 IP 和密码的痛苦。"
keywords:
  - iTerm2
  - SSH
  - 自动登录
  - Mac
  - 终端
categories:
  - 技术杂谈
tags:
  - iterm2
  - ssh自动登录
  - ssh免密码登录
abbrlink: 20763
cover: /img/20763.jpg
date: 2021-10-08 16:45:42
howto:
  - 生成SSH密钥
  - 配置iTerm2 Profile
  - 添加书签
  - 验证自动登录
---
## 痛点：频繁 SSH 登录

如果你像我一样，需要经常性的访问不同的远程服务器，记录服务器的ip和输入密码就是一件非常痛苦的事情。好在，通过在item2中做一些配置，可以很好的解决这个痛点。最终实现的效果，就是类似配置了一些ssh书签，能够在iterm2中记住ssh密码, 实现免密码登录和自动登录的效果。

<!-- more -->

## 完整配置步骤

iterm2 （https://iterm2.com/)  是mac下使用非常广泛的一款终端替代产品，提供了很多强大的功能。要实现ssh书签，实现免密码登录、自动登录的效果，关键点是其中的三个特性：profile, trigger 和 password manager.

profile顾名思义就是一套配置，像我们正常打开iterm2时，其实就是打开了default profile.  配置profile的入口就在工具栏 profiles 选项下，可以增加或编辑现有profile.  我们将需要的profile的general标签下的 commond 模块修改为 Command,  内容填入 ssh命令， 比如 ssh root@1.1.1.1, 就可以在打开profile时自动执行ssh命令。 profile中其他的文本、颜色等配置都不重要，可以按需填写。

trigger也是profile的一个特性，入口在profile配置页的advanced标签下，它的作用就是利用关键词触发一个动作，我们现在要做的就是用password这个关键词触发打开 password manager。 操作很简单，就是增加一个trigger, regular expression 填入 password,  action选择 open password manager, 注意勾选instant和enabled两个选项。

最后一个要配置的是password manager, password manager 就是一个密码管理器，是item2中会默认安装的一款插件，入口在工具栏 window 标签下。打开password manager, 将需要保存的密码都录入进去就可以了。

## 安全提醒

这样，我们就实现了在iterm2中用“书签”保存远程服务器的地址和密码。使用时，直接访问对应的profile, 等待password manager 弹出，选择对应的密码记录，点击输入就可以了。

原文地址: https://lichuanyang.top/posts/20763/

---

## 快速上手步骤

### Step 1: 生成SSH密钥

在终端执行 `ssh-keygen` 生成 SSH 密钥对，将公钥添加到目标服务器的 `~/.ssh/authorized_keys` 中，确保免密登录基础配置完成。

### Step 2: 配置iTerm2 Profile

打开 iTerm2，进入 Profiles → Open Profiles → Edit Profiles。在 General 标签页中将 Command 设置为 `ssh root@1.1.1.1` 格式的 SSH 命令。

### Step 3: 添加书签

在 Profile 编辑页的 Advanced 标签页中添加 Trigger：Regular Expression 填入 `password`，Action 选择 Open Password Manager，勾选 Instant 和 Enabled。然后在 Window → Password Manager 中录入服务器密码。

### Step 4: 验证自动登录

通过 Profiles 菜单选择配置好的 Profile，等待 Password Manager 弹出后选择对应密码记录，确认能自动完成 SSH 登录。

---
