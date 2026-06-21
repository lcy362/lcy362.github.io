---
title: Configuring SSH Bookmarks in iTerm2 for Password Storage and Auto Login
description: "Configure SSH bookmarks in iTerm2 to save passwords and enable auto login, eliminating the pain of repeatedly entering IP addresses and passwords."
keywords:
  - iTerm2
  - SSH
  - auto login
  - Mac
  - terminal
categories:
  - Tech Talk
tags:
  - iterm2
  - ssh-auto-login
  - ssh-passwordless-login
abbrlink: 20763
cover: /img/20763.jpg
date: 2021-10-08 16:45:42
---
If you're like me and frequently need to access different remote servers, recording server IPs and entering passwords can be very tedious. Fortunately, by making some configurations in iTerm2, this pain point can be well addressed. The final result is similar to configuring SSH bookmarks, enabling iTerm2 to remember SSH passwords and achieve passwordless and automatic login.

<!-- more -->

iTerm2 (https://iterm2.com/) is a widely used terminal alternative on Mac, providing many powerful features. To achieve SSH bookmarks with passwordless and automatic login, the key lies in three features: profile, trigger, and password manager.

Profile, as the name suggests, is a set of configurations. When we normally open iTerm2, we're actually opening the default profile. The entry point for configuring profiles is under the Profiles option in the toolbar, where you can add or edit existing profiles. Change the "Command" section under the General tab of the desired profile to "Command", and fill in the SSH command, such as `ssh root@1.1.1.1`, so that the SSH command is automatically executed when the profile is opened. Other text, color, and other configurations in the profile are not critical and can be filled in as needed.

Trigger is also a feature of the profile. The entry point is under the Advanced tab in the profile configuration page. Its purpose is to use a keyword to trigger an action. What we need to do now is use the keyword "password" to trigger opening the password manager. The operation is simple: add a trigger, fill in "password" for the Regular Expression, select "Open Password Manager" for the Action, and make sure to check both the "Instant" and "Enabled" options.

The last thing to configure is the password manager. The password manager is a password management tool that comes as a default plugin in iTerm2. Its entry point is under the Window tab in the toolbar. Open the password manager and enter the passwords you want to save.

This way, we've implemented "bookmarks" in iTerm2 to save remote server addresses and passwords. When using them, simply access the corresponding profile, wait for the password manager to pop up, select the corresponding password record, and click to input it.

Source: https://lichuanyang.top/en/posts/20763/
