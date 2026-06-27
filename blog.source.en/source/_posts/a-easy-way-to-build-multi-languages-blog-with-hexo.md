---
title: An Easy Way to Build a Multi-Language Blog with Hexo
date: 2024-01-23 18:41:29
tags:
 - hexo
 - blog
 - i18n
abbrlink: 40400
cover: /img/hexo-multi-language.jpg
---

## Common Multi-language Blog Solutions

The simplest way to use hexo to build a multilingual website is to directly build two independent sites and make a jump link to each other. 

Here's how to implement it.

## Solution Comparison

Suppose I now have a Chinese blog and plan to add an English site

## Hexo Dual-site Implementation Details

- Copy the entire blog directory as the English blog directory. For example, my blog root directory is called blog.source, and copy a blog.source.en. After this, if source code of the blog is maintained using git, you can just create a new git project directly in the outer layer of the original directory and manage it in the outer layer. For example:
     ```
         blog(git root directory)/blog.source
                                 /blog.source.en
     ```

- Delete all articles in the en directory; adjust text such as site description to English content; set the English language to en; set the English site root (root configuration in _config.yml) to /en
- Add jump links under two sites. I used the menu function to directly add an other language item to the menu. The configuration in the next theme is as follows:
     ```
     Chinese site:      English: /en || fa fa-language
     English site:      Chinese: https://lichuanyang.top || fa fa-language

     ```
- After that, the configuration is basically completed. You can write English articles in the en directory. The process is exactly the same as when writing Chinese articles before.

## Deployment and CI/CD

- The last step is to generate and publish. Pay attention to this step. Everytime we generate, we need to generate a Chinese site first, then generate an English site and copy the English content to the Chinese directory to avoid overwriting the English content when generating Chinese content.  Specific operation examples are as follows:
  ```
  hexo clean && hexo g &&cd ../blog.source.en && hexo clean && hexo g && cd ../blog.source &&cp -r ../blog.source.en/public/. public/en/ && hexo s
  ```
At the end of the command, use hexo s to start locally, use hexo d to publish it, just like normal use.

In this way, we now have a multi-language site which is quite easy to use. After that, write Chinese content in the Chinese directory, write English content in the English directory, and finally execute the above command.

Original address： https://lichuanyang.top/en/posts/40400/
