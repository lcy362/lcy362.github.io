---
layout: blog
title: "What Are SSP, DSP, RTB, and ADX? Understanding the Concepts and Evolution of Internet Advertising"
description: "Starting from the essence of advertising, systematically untangle the evolution of internet advertising, explaining core concepts like SSP, DSP, RTB, ADX and the underlying logic of programmatic trading."
keywords:
  - internet advertising
  - ssp
  - dsp
  - rtb
  - adx
  - programmatic trading
categories:
  - Tech Talk
date: 2022-03-07 16:28:58
abbrlink: 27934
cover: /img/27934.jpg
tags:
  - computational-advertising
  - internet-advertising
  - rtb
---

In this article, I will introduce the current state of internet advertising and untangle the underlying logic of internet advertising, to help everyone better understand this industry.

<!-- more -->

## What Is Advertising

When discussing internet advertising, we must first start with what advertising itself is. Only by understanding the underlying logic of advertising can we better understand what problems exist in internet advertising, why programmatic advertising trading emerged, why various systems like ADX, SSP, DSP, DMP appeared, and other similar questions.

The advertising industry has actually existed since ancient times — from street vendors' hawking in ancient times, to signs on buildings, to ads in print newspapers, magazines, TV, and other traditional media, and then to internet advertising, this industry has always evolved along with societal development.

For advertising, let's first provide a very official, very standard definition: Advertising is a paid, comprehensive, persuasive, non-personal information dissemination activity about products (goods, services, and ideas) conducted through various media by identified sponsors.

More colloquially, in advertising transactions, there are three core participants: the media (the supply side), the advertisers (the demand side), and the audience (the media's users). The media and advertisers are active participants, while the audience is a passive participant. Advertising is essentially a process of game theory among these three parties. Advertisers want more audience members to see their ads and achieve higher conversion rates; media want to maximize advertising revenue while minimizing disruption to users; and the audience — ordinary users — simply wants to avoid being bothered by ads they don't want to see.

Next, let's analyze the strategic considerations in this process. As everyone knows, if something is a zero-sum game for all participants, it will inevitably fall into cutthroat competition and be difficult to develop. Since the advertising industry has been able to sustain healthy development, it is mainly due to its impact outside the advertising ecosystem. So let's analyze what external factors influence the advertising ecosystem.

Let's first break down what each party considers. For the media, the main metrics are advertising revenue and product retention. For advertisers, it's advertising costs and the revenue gained from advertising. As passive participants, the audience can do little during this process — they can only vote with their feet by leaving products with terrible ads. Among these, what lies outside the entire advertising ecosystem are two aspects: the revenue advertisers gain from advertising, and reducing the disruption advertising causes to the audience. In fact, improving these two points is the driving force behind the continuous development of the entire advertising industry.

Understanding this point helps us better understand the development history of internet advertising.

## The Development History of Internet Advertising

## Early Development of Internet Advertising

The earliest internet advertising was essentially a direct migration of traditional media advertising formats online. For example, in a newspaper, there would be a dedicated area for ads. The ads we used to see on websites like Sohu and Sina were also in this format. Advertisers would directly purchase a specific area on a webpage to display certain ad content.

Later, some people gradually noticed a key difference between internet advertising and traditional media: internet advertising content can vary from person to person. Printed newspapers look the same to everyone, but websites can easily show different ads to different groups, such as men and women. The media only needed to guarantee the advertiser a certain delivery volume and compensation methods when the delivery targets were not met. This is known as contract-based advertising.

A natural development trend of contract-based advertising is increasingly granular targeting — gender, age, location, interests, and hobbies can all become part of the contract terms. At the same time, more and more advertisers entered the scene. Both of these factors would cause the difficulty of fulfilling contracts to increase dramatically. Moreover, under such complex logic, the media also felt that a lot of their traffic was not being sold at the highest possible price.

In this situation, a new advertising format emerged: auction-based advertising. The supply side no longer guarantees volume through contracts, only guaranteeing the cost per unit of traffic. Each ad impression is decided based on the highest revenue principle. In this way, advertising gradually evolved into a "traffic trading" model, forming programmatic advertising trading.

## Programmatic Advertising Trading

In the scenario of auction-based advertising, without contract constraints, a large number of media and advertisers entered a multi-party game environment, making the transaction process increasingly complex and giving rise to transaction methods such as RTB (Real-Time Bidding). Programmatic advertising trading emerged precisely in this context.

Meanwhile, with the development of technology, more data, deeper computation and prediction became possible, and all participants — advertisers, media, and related advertising agencies — needed richer functionality. The terms mentioned in our title — SSP, ADX, DSP, RTB — also gradually developed into very important systems in the advertising ecosystem under these circumstances.

Overall, programmatic advertising trading is very similar to real-time trading scenarios like stock trading — there is a trading venue (ADX), buyers (advertisers), and sellers (media), each making real-time buying and selling decisions within it. The only important difference is that for media, there is no opportunity to time the market; when traffic arrives, it must be sold immediately, with no way to hold it and wait for a good opportunity. This point is precisely the starting point for the development of various advertising-related technologies.

## Key Issues and Components of Internet Advertising

As mentioned earlier, there are two driving forces behind the development of internet advertising: increasing the revenue advertisers gain from advertising, and reducing the disruption advertising causes to the audience. Both of these relate to advertising effectiveness, so let's analyze what factors influence advertising effectiveness.

The lifecycle of an ad can roughly be broken down into these steps:

Exposure → Attention → Understanding → Acceptance → Retention → Decision

Simply put, the ad must first be displayed, then be seen by the audience, who must understand the message the ad is trying to convey. Furthermore, they must accept this message and retain it for some time, ultimately completing the product decision promoted by the ad (download, purchase, payment, etc.).

Next, let's go through the specific impact of each step and what role internet technology can play.

**Exposure**: This stage mainly depends on the physical properties of the ad placement. For example, an ad on an app's splash screen versus an ad buried deep on some hidden page — their effectiveness will obviously differ greatly. This is the same in real-world advertising, and there isn't much room for technological optimization here.

**Attention**: This means getting users to notice the ad. It's worth noting that "seeing" does not equal "noticing." If the product design is unreasonable, users can easily overlook what's right in front of them. For example, if a user comes to a page with a very specific task — say, downloading something — then forcing an ad into their download process will very likely cause the user to completely ignore it. Therefore, this step is closely related to product design. Additionally, this is a stage where technology can play an important role. By building a DMP (Data Management Platform) and combining various machine learning algorithms, ads can be delivered to users who are more likely to be interested, thereby increasing ad effectiveness.

**Understanding**: The factor with the greatest impact at this step is the ad creative. Well-designed creative content helps users better understand the message.

**Acceptance**: Simply put, this is about whether users can认可 the information or viewpoint your ad presents. On one hand, this relates to whether the creative is professional; on the other hand, it has a lot to do with the media's own attributes. For example, the same information placed on DingXiang Doctor versus some Putian hospital website would have vastly different effectiveness.

**Retention and Attention**: These two steps gradually move beyond the scope of the advertising ecosystem, but through quality creative design, appropriate scenarios, and precise audience targeting, they can still lay the groundwork for the final conversion.

Additionally, for stages that these technologies cannot directly intervene in, providing more complete data and more convenient testing methods can also bring significant help to ad performance.

Next, let's look separately from the perspective of media and advertisers to understand their respective needs, and briefly examine how platforms like SSP and DSP work. Due to space constraints, this part will not be detailed here. If you're interested, we can explore each one in future articles.

The platform serving the media is what's commonly known as SSP, whose main function is to help media increase revenue. Some basic features include allowing media to configure ad placements and specifying dimensions like width and height. For increasing revenue, the main approaches are matching the right audience with the right ads, optimizing pricing strategies, and attempting to control IT costs such as network expenses.

The counterpart to SSP is DSP, which serves the advertiser side. The basic function of DSP is to allow advertisers to set up delivery plans — for example, over what time period, to what type of users, with what total budget. The value the platform provides is mainly helping advertisers spend less to achieve better ad results.

Even today, every module involved in the advertising ecosystem is still undergoing continuous iteration, but the underlying principle remains the same: the key driving force is making ad delivery more effective while providing users with a better ad browsing experience. Only in this way can the entire industry develop in a healthy direction.

Original article: https://lichuanyang.top/posts/27934/

---

Source: https://lichuanyang.top/en/posts/27934/
