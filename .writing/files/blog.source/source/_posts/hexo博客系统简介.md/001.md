---
title: hexo教程：博客系统搭建及部署到github
description: "Hexo 博客系统入门教程，从安装初始化到部署 GitHub Pages，适合后端程序员快速搭建个人博客。"
keywords:
  - Hexo
  - 博客搭建
  - GitHub Pages
  - Node.js
  - 教程
categories:
  - 技术杂谈
tags:
  - hexo
  - 博客搭建
abbrlink: 19890
cover: /img/hexo-blog-system.jpg
date: 2018-01-19 18:56:07
---
原文地址： https://lichuanyang.top/posts/19890/

Hexo是一款开源的博客系统。对于一个后端程序员来说，不想折腾前端的东西，但是csdn,博客园之类的用起来还是不太方便，自己搭博客又麻烦，做出来还丑。偶然间看到了hexo,这个对后端程序员来说可以说是非常友好了。所以也写篇文章记录一下hexo安装,一些关键配置，以及部署到github的过程。

## 安装及初始化
参考[官方文档](https://hexo.io/docs/index.html) 就可以了。hexo是基于node.js的，用过node的自然没有任何问题，没用过也没关系，照着说明文档做就可以了。

hexo支持直接向github的page发布，只需要配置好自己的github信息就可以。

## 主题
hexo有很多定制[主题](https://hexo.io/themes/), 按个人喜好使用吧， 我用的是[next](https://github.com/theme-next/hexo-theme-next) , 这款主题功能非常多，统计、搜索之类的都是一条配置都搞定了。不过这款的一些基础配置和其他主题似乎是有些区别的，所以用了以后如果以后想换别的可能会有点困难。

## 内容迁移
hexo提供了多个从其他博客迁移数据的插件，rss,blogger等等都可以。

以博客园为例，博客园的博客可以导出一个rss文件，然后我们用hexo-migrator-rss就可以生成hexo格式的文件了，不过有可能需要做一些微调。

## 插件及第三方服务
前边说了，hexo配合next主题，很多工具用起来会非常方便。

主要参考next的[文档](http://theme-next.iissnan.com/third-party-services.html)就可以了，不过这份文档有些老了，具体的还要参考next的主题配置文件，里边的说明也比较详细。

推荐一些比较有用的：
* 百度、google等的统计工具: 在next里是把自己的id配上就可以，就不用去加js代码了
* gitment: 基于github issue的评论系统， 用github账号登录以后就可以发评论了。毕竟看技术博客的人github账号大家都有，这样比其他评论系统方便些。
* hexo-generator-searchdb: 一个本地搜索工具，使用之后在博客首页加个搜索框
* hexo-generator-feed: 生成rss文件，以支持订阅
* hexo-abbrlink：默认的文章地址是带文章标题的，特别是中文标题真的是反人类，这个会给每篇文章生成一个id，然后用id做地址
* hexo-generator-robotstxt， hexo-generator-sitemap: 生成sitemap,robots.txt, 帮助搜索引擎爬数据，不多说了
* leancloud: 统计每篇文章访问量，并且在页面上显示

包括部署到github， 也有现成的配置可以用，简单配置一下就好了。

弄完之后，就是大家现在看到的样子了。

---
