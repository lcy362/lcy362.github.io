---
title: "How I Recovered My Blog After Vercel Banned 163 Email"
description: "A firsthand account of Vercel banning 163 email causing blog deployment failure, and a complete solution from discovering the issue to migrating and recovering."
keywords:
  - Vercel
  - 163 email
  - blog deployment
  - Hexo
  - migration
categories:
  - Tech Talk
tags:
  - vercel
  - blog
  - devops
  - independent-blog
abbrlink: 39648
date: 2026-05-11 19:30:00
---

A few days ago, I wrote a new article and deployed it to Vercel as usual, but the pipeline threw an error. At first I thought it was a build issue, and after messing around for a while I realized something was wrong — it was the Vercel account itself. The account registered with a 163 email couldn't log in at all. Later I found out that Vercel had banned the entire 163.com email root domain.

<!-- more -->

## What is Vercel?

If you're into independent blogging, you've probably heard of or are currently using Vercel. Simply put, it's a frontend deployment platform that supports automatically pulling code from GitHub repositories, building, and deploying. It assigns a domain name to your website and includes CDN acceleration. Many people's blogs use the GitHub Pages + Vercel combination — code on GitHub, using Vercel for deployment and hosting.

My own blog was set up this way. GitHub Pages can deploy static pages directly, but Vercel is more convenient for custom domains, HTTPS, and CDN, so I chose it.

## The Full Story of the 163 Email Ban

Around May 4, 2026, a large number of users who registered Vercel with 163 email suddenly found they couldn't log into their accounts. I searched online and found it wasn't just me — forums like NodeSeek and V2EX had people discussing the same issue.

According to online information, Vercel suffered a relatively serious security incident in mid-April 2026. The hacking group ShinyHunters breached Vercel's internal systems through a third-party AI tool, stealing employee data, enterprise backend access, and some deployment credentials, and even demanded a $2 million ransom.

The 163 email ban was likely one of the security measures taken in response. It may be because 163 email was extensively used in this incident for malicious registrations or attacks, or it may just be Vercel applying stricter risk controls to certain email domains. Vercel hasn't publicly stated the specific reason, but the result was that the entire 163.com email domain was blanket banned.

The impact was significant. Many domestic developers and independent blog authors use 163 email to register Vercel, and this ban directly made all their blogs inaccessible.

However, if your Vercel account is still logged in (for example, your work computer's browser maintains the login session), you can actually salvage it: go to account settings, add a new email (Outlook or Gmail both work), and then remove the 163 email. This way the account can continue to be used normally without redeployment. Someone online shared this method, which can save a lot of trouble. But if you're like me and by the time you discovered it, you were completely locked out, then you'll have to follow the rebuild process below.

## Recalling My Blog Deployment Architecture

The account was banned, the blog was inaccessible. The first thing I needed to do was figure out exactly how my blog was deployed. Honestly, the blog configuration was set up a long time ago, and I hadn't touched it much since. I couldn't remember the exact process very well.

It took considerable effort to recall. The general pipeline was:

1. Blog source code is in a GitHub repository
2. Vercel connects to the GitHub repository, responsible for building and deploying
3. Domain name resolution was split into two layers: Alibaba Cloud DNS points to Cloudflare, Cloudflare then points to Vercel

Why make it so complicated? Mainly to use Cloudflare's CDN and security capabilities. Alibaba Cloud as the domain registrar, Cloudflare as the intermediate layer for DNS management and CDN, Vercel as the final static page host. When I configured it, I was following some online tutorials. Although the chain was a bit long, it ran stably for a long time, so I never changed it.

## Recovery Process: New Account + Redeployment

Once I figured out the deployment architecture, the recovery process was actually not complicated.

**Step 1: Register a new Vercel account**

I learned my lesson this time and didn't use 163 email. I registered a new Vercel account with Outlook. Gmail would also work, but considering this was Vercel banning specific email domains, using a mainstream international email service would be more reliable.

**Step 2: Redeploy the GitHub project**

After logging into the new account, I connected GitHub and imported the blog repository into Vercel. Vercel automatically detected the project type, and the build and deployment were completed automatically, basically the same as before.

**Step 3: Reconfigure the domain**

This was the key step. Since the previous domain resolution followed the Alibaba Cloud → Cloudflare → Vercel chain, I needed to bind the domain to the new Vercel project after redeployment.

What pleasantly surprised me was that Vercel now supports automatically modifying Cloudflare DNS configuration when adding a custom domain. I remember previously having to manually go to Cloudflare's backend to add CNAME records. Now Vercel handles it directly through API — just a few clicks and it's done.

The entire recovery process, from registering a new account to having the blog accessible again, took less than half an hour.

## Lessons Learned

1. **Don't use domestic email to register overseas services.** Domestic email services like 163 and QQ mail are inherently high-risk targets in overseas services' risk control systems. This time it was Vercel; next time it could be another service. It's recommended to use Gmail or Outlook for primary accounts.

2. **Keep good records of your deployment architecture.** The most time-consuming part of this incident was recalling the deployment pipeline. I thought I remembered it all after configuring it, but after so long I had mostly forgotten. I recommend writing down your deployment architecture and key configurations in notes, even if it's just a few sentences.

3. **Vercel's Cloudflare integration is now quite good.** Previously when configuring DNS manually, it was error-prone. Now with much higher automation, the cost of redeployment has been significantly reduced.

4. **If possible, prepare backups and multi-platform options.** I was lucky this time and recovery was relatively quick. But if the GitHub repository also had issues, or if Vercel completely banned the project rather than just the account, recovery would be much more troublesome. For important blog content, it's recommended to have a copy locally or on another platform.

## Final Thoughts

This incident of Vercel banning 163 email serves as a wake-up call for everyone who uses domestic email to register overseas services. We can't control the platform's security measures, but we can prepare in advance for our own account security and deployment architecture.

If you've also encountered the issue of Vercel 163 email being banned or Vercel account login failure, I hope this article helps. The core recovery approach is: register a new account with a different email, redeploy the project, and rebind the domain. The operations aren't complicated, but the prerequisite is that you need to remember your deployment pipeline.

Original article: http://lichuanyang.top/posts/39648/

---

Source: https://lichuanyang.top/en/posts/39648/
