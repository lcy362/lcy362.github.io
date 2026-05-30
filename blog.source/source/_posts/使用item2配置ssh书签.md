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
date: 2021-10-08 16:45:42
---
如果你像我一样，需要经常性的访问不同的远程服务器，记录服务器的ip和输入密码就是一件非常痛苦的事情。好在，通过在item2中做一些配置，可以很好的解决这个痛点。最终实现的效果，就是类似配置了一些ssh书签，能够在iterm2中记住ssh密码, 实现免密码登录和自动登录的效果。

<!-- more -->

iterm2 （https://iterm2.com/)  是mac下使用非常广泛的一款终端替代产品，提供了很多强大的功能。要实现ssh书签，实现免密码登录、自动登录的效果，关键点是其中的三个特性：profile, trigger 和 password manager.

profile顾名思义就是一套配置，像我们正常打开iterm2时，其实就是打开了default profile.  配置profile的入口就在工具栏 profiles 选项下，可以增加或编辑现有profile.  我们将需要的profile的general标签下的 commond 模块修改为 Command,  内容填入 ssh命令， 比如 ssh root@1.1.1.1, 就可以在打开profile时自动执行ssh命令。 profile中其他的文本、颜色等配置都不重要，可以按需填写。

trigger也是profile的一个特性，入口在profile配置页的advanced标签下，它的作用就是利用关键词触发一个动作，我们现在要做的就是用password这个关键词触发打开 password manager。 操作很简单，就是增加一个trigger, regular expression 填入 password,  action选择 open password manager, 注意勾选instant和enabled两个选项。

最后一个要配置的是password manager, password manager 就是一个密码管理器，是item2中会默认安装的一款插件，入口在工具栏 window 标签下。打开password manager, 将需要保存的密码都录入进去就可以了。

这样，我们就实现了在iterm2中用“书签”保存远程服务器的地址和密码。使用时，直接访问对应的profile, 等待password manager 弹出，选择对应的密码记录，点击输入就可以了。

原文地址: https://lichuanyang.top/posts/20763/
---
