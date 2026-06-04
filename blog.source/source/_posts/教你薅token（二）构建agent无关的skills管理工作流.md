---
title: 教你薅token（二）：构建agent无关的skills管理工作流
description: >-
  上篇说"文档才是核心"，那文档怎么管？我用400行bash写了个skill管理器，把AI工作流打包成可移植的技能包，按需装到项目里，不绑定任何Agent平台。
keywords:
  - AI Agent
  - skills
  - 工作流
  - CLI
  - bash
  - 效率工具
categories:
  - AI实践
tags:
  - AI Agent
  - LLM
  - 效率工具
  - 工作流
  - CLI
abbrlink: 26061
date: 2026-06-04 22:00:00
---

上篇文章最后说了句：**Agent只是工具，文档才是核心。**

这话说了之后，有人问我：道理都懂，但文档具体怎么管？总不能每个项目都复制粘贴一遍吧？

确实不能。

我后来写了个工具来解决这事——[pks](https://github.com/lcy362/personal-skills-manager)（Personal Skills Manager），408行纯bash，零依赖。它干的事很简单：把你的AI工作流文档打包成skill，按需装到项目里，不绑定任何Agent平台。

<!-- more -->

## 什么是skill

如果你用过OpenCode、Cursor或者其他Agent平台，大概率见过"skill"这个概念。不同平台叫法不一样——有的叫skill，有的叫rules，有的叫custom instructions——但说的都是同一件事：**你给Agent的结构化指令，告诉它怎么处理特定类型的任务。**

比如"调用我们的API网关时，参数必须平铺在body顶层，不要嵌套在params里"，这是一条skill。"commit消息必须用中文，格式是type(scope):描述"，这也是。"数据库表名用snake_case，字段必须有注释"，还是。

Agent的底层模型提供了通用推理能力——它知道怎么写代码、怎么调API。但你的API网关有什么坑、你们团队的命名习惯是什么、你们项目为什么选了这个架构——这些知识模型不知道，得你告诉它。skill就是你告诉Agent这些东西的方式。

各平台管理skill的方式各不相同。OpenCode用`.opencode/skills/`目录，Cursor用`.cursorrules`，Claude Code读`CLAUDE.md`。格式不同，机制不同，但本质没区别：都是一份文档，Agent读到就按里面的规则干活。

skill本身不依赖任何平台。一个用Markdown写好的skill文件夹，丢进任何项目里，任何Agent找到了都会读、都会用。**纯Markdown，谁来都能读。**

## 问题出在哪

skill是个好东西，但问题来了：你手上有好几个项目。

一份团队编码规范，项目A要用，项目B要用，项目C也要用。你怎么管？

常见的做法是，把这些配进agent本身的配置里，也就是常规的“安装skill”操作，比如给opencode装个微信读书skill, 这样，所有的项目用opencode打开，就都能用上。

这本来是没啥问题的，除非你看了我上一篇文章.. 

在我们想打造agent无关的工作流的情况下，这么干问题就大了。哪天你看到有个新agent在送免费token, 下来一用，发现一堆skill都得自己迁移，这不就傻了吗。

所以我开发pks的初衷，就是把这一层抽出来，解套。让对这些不通用skill的管理，独立于所有的agent和项目，单独成一个体系。

## pks怎么解决

pks最适合管理那些**非通用的、项目或团队特有的**指令：你的编码风格偏好和commit规范、团队的代码规范和CI/CD流程、项目的架构决策记录和API设计约束等。

pks要解决的就是一件事：**在一个地方管理所有skill，按需装到任何项目里。**

然后，所有skill集中存在一个全局仓库里。项目需要哪些，装哪些。

全局操作就三个核心命令：

```bash
pks new my-skill       # 基于模板创建skill骨架
pks list               # 看看你有哪些skill
pks delete my-skill    # 删掉不要的
```

项目操作也很简单：

```bash
cd your-project
pks init                        # 初始化（只执行一次）
pks install my-skill            # 装一个skill进来
pks status                      # 看看装了哪些
pks uninstall my-skill          # 不想要了就卸掉
```

装好之后，skill会被复制到项目的`.skills/`目录：

```
your-project/
├── .skills/
│   ├── INDEX.md              # 自动生成的索引
│   └── my-skill/
│       └── SKILL.md           # 你的skill内容
└── ...
```


## Agent怎么发现这些skill

这其实是个很自然的流程。

每次install或uninstall，pks会自动重建`.skills/INDEX.md`。这个索引文件列出所有已安装的skill，附带描述和版本，并且包含一句话：

> Agents: read the `SKILL.md` file in each skill directory below for relevant instructions.

任何Agent进到项目都会看到这个目录，读INDEX.md，然后按需加载具体的SKILL.md。

最多你就在项目的AGENTS.md里再加一句去skill目录下找技能。按我的经验，对大部分agent来说，都没这个必要，它们都很自然的就找到这些技能了。


## 什么时候会用到

说个最常见的场景：你负责一个项目，新人要加入开发。

传统做法是什么？甩一份README，口头交代几句"我们commit要这么写"、"那个内部库要那么调"、"数据库字段别随便改"。剩下的全靠悟。

用Agent辅助也差不多——你把规则塞进CLAUDE.md或AGENTS.md，Agent每次对话都吃一遍，不管这次任务跟这些规则有没有关系。

换个思路。把这些知识拆成几个skill：

```
skills/
├── team-coding-style/     # 团队编码规范、命名约定、commit格式
│   └── SKILL.md
├── internal-api-gateway/  # 内部API网关：参数平铺、鉴权方式、踩坑记录
│   ├── SKILL.md
│   ├── pitfalls.md        # 常见坑点（比如参数不能嵌套在params里）
│   └── fields.md          # 回包字段含义速查
├── project-architecture/  # 架构决策：模块划分、目录结构、为什么这么设计
│   └── SKILL.md
└── db-conventions/        # 数据库规范：命名、索引策略、迁移流程
    └── SKILL.md
```

新人入职？`pks init`，`pks install team-coding-style`，`pks install project-architecture`，几分钟装好。Agent读到这些skill，立刻知道这个项目的规矩。换一个人、换一台机器、换一个Agent平台，同样的skill装上去，效果一样。

而且**只有装了才消耗token**。一个纯前端项目不需要装数据库规范的skill，一个老项目不需要装新人引导的skill。相比把所有规则塞进一个巨大的配置文件让Agent每次对话都吃一遍，按需安装能省下不少无用token——这本身就是在薅自己的token。

这种**非通用类**的指令才是pks的主场。通用能力Agent自己就有，但你的团队规范、你的项目约定、你踩过的坑——这些东西只对你有用，也只该在需要的时候才出现。

## 为什么是纯bash

pks整个CLI是408行bash脚本。不用Python，不用Node.js，不用任何运行时。git clone下来就能跑。

为什么这么极端？因为skill管理工具本身不应该引入任何负担。你的工作流已经够复杂了，管理它的工具应该尽可能简单——简单到不会因为某个运行时版本升级而挂掉。

bash在macOS和Linux上开箱即用，十年前的脚本今天还能跑。这就是零依赖的好处：**你的工作流文档比任何框架都长寿。**


## 设计上的几个小心思

pks有几个设计细节值得提一嘴。

**语义化版本**：每个skill的YAML front matter里有version字段。skill迭代了，版本号跟着涨，项目里装了哪个版本一目了然。

**全局管理，按需安装**：所有skill集中在一个仓库里维护，项目里只装需要的。

**模板保护**：以`_`开头的skill（比如`_template`）不会出现在列表里，也不能被删除。`pks new`创建新skill时自动基于模板生成骨架，不用从零写起。

**路径无关**：pks通过符号链接解析和相对路径定位，在任何位置调用都能正确找到skills目录。不管你从哪个路径执行命令，它都知道自己的家在哪。

## 回到那句话

上篇说"Agent只是工具，文档才是核心"。这篇把它往前推了一步：**文档化的工作流，是可以被管理的。**

pks不是什么高深的东西，408行bash而已。但它代表了一个态度：你的工作流是你的资产，不是任何平台的附属品。

该薅token薅token，该管skill管skill。钱要省，活要干好，这两件事不矛盾。

原文地址：https://lichuanyang.top/posts/26061/
