---
title: "Hexo Tutorial: Setting Up a Blog System and Deploying to GitHub"
description: "A Hexo blog system getting started tutorial, from installation and initialization to deploying on GitHub Pages, suitable for backend developers to quickly set up a personal blog."
keywords:
  - Hexo
  - blog setup
  - GitHub Pages
  - Node.js
  - tutorial
categories:
  - Tech Talk
tags:
  - hexo
  - blog-setup
abbrlink: 19890
date: 2018-01-19 18:56:07
---

Original article: https://lichuanyang.top/posts/19890/

Hexo is an open-source blog system. For a backend developer who doesn't want to deal with frontend stuff, but still finds platforms like CSDN and cnblogs inconvenient, and building your own blog from scratch is troublesome and ugly — I stumbled upon Hexo, which is extremely friendly for backend developers. So I'm writing this article to document the Hexo installation, some key configurations, and the process of deploying to GitHub.

## Installation and Initialization

Just refer to the [official documentation](https://hexo.io/docs/index.html). Hexo is based on Node.js. If you've used Node.js before, there should be no issues at all. If not, that's fine too — just follow the documentation.

Hexo supports direct publishing to GitHub Pages. You just need to configure your GitHub information properly.

## Themes

Hexo has many customizable [themes](https://hexo.io/themes/). Choose based on your personal preference. I use [Next](https://github.com/theme-next/hexo-theme-next), which has a lot of features — analytics, search, and many other tools can be configured with just a single line. However, some of Next's basic configurations seem to differ from other themes, so if you switch to another theme later, it might be a bit difficult.

## Content Migration

Hexo provides plugins for migrating data from other blogs, supporting RSS, Blogger, and more.

Using cnblogs as an example, cnblogs blogs can export an RSS file, and then we can use hexo-migrator-rss to generate Hexo-format files. However, some minor adjustments might be needed.

## Plugins and Third-Party Services

As mentioned earlier, Hexo combined with the Next theme makes many tools very convenient to use.

Mainly refer to Next's [documentation](http://theme-next.iissnan.com/third-party-services.html). However, this documentation is a bit outdated, so the specific details should be based on Next's theme configuration file, which has more detailed explanations.

Some recommended useful ones:
* Analytics tools like Baidu and Google: In Next, you just configure your ID, no need to add JS code manually.
* Gitment: A comment system based on GitHub Issues. After logging in with your GitHub account, you can post comments. Since tech blog readers all have GitHub accounts, this is more convenient than other comment systems.
* hexo-generator-searchdb: A local search tool that adds a search box to the blog homepage.
* hexo-generator-feed: Generates RSS files to support subscriptions.
* hexo-abbrlink: The default article URL includes the article title, which is especially ugly with Chinese titles. This plugin generates an ID for each article and uses the ID in the URL.
* hexo-generator-robotstxt and hexo-generator-sitemap: Generate sitemap and robots.txt to help search engines crawl data. No further explanation needed.
* LeanCloud: Tracks visit counts for each article and displays them on the page.

Including deployment to GitHub, there are ready-made configurations available. Just do a simple configuration.

After everything is done, this is what it looks like — what you see now.

---

Source: https://lichuanyang.top/en/posts/19890/
