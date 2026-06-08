---
title: 一篇不错的lda模型入门文档
description: "LDA（Latent Dirichlet Allocation）主题模型入门学习笔记，帮助理解 LDA 的基本概念和应用场景。"
keywords:
  - LDA
  - 主题模型
  - 自然语言处理
  - 机器学习
categories:
  - 技术杂谈
tags:
  - LDA
  - 大数据
abbrlink: 63299
cover: /img/63299.png
date: 2012-12-02 15:20:00
---
转自[http://leyew.blog.51cto.com/5043877/860255#559183-tsina-1-46862-ed0973a0c870156ed15f06a6573c8bf0](http://leyew.blog.51cto.com/5043877/860255#559183-tsina-1-46862-ed0973a0c870156ed15f06a6573c8bf0)

前几天开始学习lda,走了不少弯路，对lda仍然是一头雾水。看了这篇文档以后总算明白lda是干啥的了

&nbsp;

### LDA（Latent Dirichlet Allocation）学习笔记

最近在看LDA算法，经过了几天挣扎，总算大致了解了这个算法的整体框架和流程。

#### 示例

LDA要干的事情简单来说就是为一堆文档进行聚类（所以是非监督学习），一种topic就是一类，要聚成的topic数目是事先指定的。聚类的结果是一个概率，而不是布尔型的100%属于某个类。国外有个博客[1]上有一个清晰的例子，直接引用：

> Suppose you have the following set of sentences:
> 
> *   I like to eat broccoli and bananas.
> *   I ate a banana and spinach smoothie for breakfast.
> *   Chinchillas and kittens are cute.
> *   My sister adopted a kitten yesterday.
> *   Look at this cute hamster munching on a piece of broccoli.
> 
> 
> What is latent Dirichlet allocation? It&rsquo;s a way of automatically discovering topics that these sentences contain. For example, given these sentences and asked for 2 topics, LDA might produce something like
> 
> *   **Sentences 1 and 2**: 100% Topic A
> *   **Sentences 3 and 4**: 100% Topic B
> *   **Sentence 5**: 60% Topic A, 40% Topic B
> *   **Topic A**: 30% broccoli, 15% bananas, 10% breakfast, 10% munching, &hellip; (at which point, you could interpret topic A to be about food)
> *   **Topic B**: 20% chinchillas, 20% kittens, 20% cute, 15% hamster, &hellip; (at which point, you could interpret topic B to be about cute animals)

上面关于sentence 5的结果，可以看出来是一个明显的概率类型的聚类结果（sentence 1和2正好都是100%的确定性结果）。

再看例子里的结果，除了为每句话得出了一个概率的聚类结果，而且对每个Topic，都有代表性的词以及一个比例。以Topic A为例，就是说所有对应到Topic A的词里面，有30%的词是broccoli。在LDA算法中，会把每一个文档中的每一个词对应到一个Topic，所以能算出上面这个比例。这些词为描述这个Topic起了一个很好的指导意义，我想这就是LDA区别于传统文本聚类的优势吧。

#### LDA整体流程

先定义一些字母的含义：

*   文档集合**D**，topic集合**T**
*   D中每个文档d看作一个单词序列**&lt; w1,w2,...,wn &gt;**，wi表示第i个单词，设d有n个单词。（LDA里面称之为_word bag_，实际上每个单词的出现位置对LDA算法无影响）
*   D中涉及的所有不同单词组成一个大集合**VOCABULARY**（简称**VOC**）

LDA以文档集合D作为输入（会有切词，去停用词，取词干等常见的预处理，略去不表），希望训练出的两个结果向量（**设聚成k个Topic，VOC中共包含m个词**）：

*   **对每个D中的文档d，对应到不同topic的概率&theta;<sub>d</sub>&nbsp;&lt; p<sub>t1</sub>,..., p<sub>tk</sub>&nbsp;&gt;**，其中，p<sub>ti</sub>表示d对应T中第i个topic的概率。计算方法是直观的，p<sub>ti</sub>=n<sub>ti</sub>/n，其中n<sub>ti</sub>表示d中对应第i个topic的词的数目，n是d中所有词的总数。
*   **对每个T中的topic t，生成不同单词的概率&phi;<sub>t</sub>&nbsp;&lt; p<sub>w1</sub>,..., p<sub>wm</sub>&nbsp;&gt;**，其中，p<sub>wi</sub>表示t生成VOC中第i个单词的概率。计算方法同样很直观，p<sub>wi</sub>=N<sub>wi</sub>/N，其中N<sub>wi</sub>表示对应到topic t的VOC中第i个单词的数目，N表示所有对应到topic t的单词总数。

LDA的核心公式如下：

**p(w|d) = p(w|t)*p(t|d)**

直观的看这个公式，就是以Topic作为中间层，可以通过当前的&theta;<sub>d</sub>和&phi;<sub>t</sub>给出了文档d中出现单词w的概率。其中p(t|d)利用&theta;<sub>d</sub>计算得到，p(w|t)利用&phi;<sub>t</sub>计算得到。

实际上，利用当前的&theta;<sub>d</sub>和&phi;<sub>t</sub>，我们可以为一个文档中的一个单词计算它对应任意一个Topic时的p(w|d)，然后根据这些结果来更新这个词应该对应的topic。然后，如果这个更新改变了这个单词所对应的Topic，就会反过来影响&theta;<sub>d</sub>和&phi;<sub>t</sub>。

LDA算法开始时，先随机地给&theta;<sub>d</sub>和&phi;<sub>t</sub>赋值（对所有的d和t）。然后上述过程不断重复，最终收敛到的结果就是LDA的输出。

再详细说一下这个迭代的学习过程：

针对一个特定的文档d<sub>s</sub>中的第i单词w<sub>i</sub>，如果令该单词对应的topic为t<sub>j</sub>，可以把上述公式改写为：

_p<sub>j</sub>(w<sub>i</sub>|d<sub>s</sub>) = p(w<sub>i</sub>|t<sub>j</sub>)*p(t<sub>j</sub>|d<sub>s</sub>)_

先不管这个值怎么计算（可以先理解成直接从&theta;<sub>ds</sub>和&phi;<sub>tj</sub>中取对应的项。实际没这么简单，但对理解整个LDA流程没什么影响，后文再说。）。现在我们可以枚举T中的topic，得到所有的p<sub>j</sub>(w<sub>i</sub>|d<sub>s</sub>)，其中j取值1~k。然后可以根据这些概率值结果为d<sub>s</sub>中的第i个单词w<sub>i</sub>选择一个topic。最简单的想法是取令p<sub>j</sub>(w<sub>i</sub>|d<sub>s</sub>)最大的t<sub>j</sub>（注意，这个式子里只有j是变量），即

_argmax[j]p<sub>j</sub>(w<sub>i</sub>|d<sub>s</sub>)_

当然这只是一种方法（好像还不怎么常用），实际上这里怎么选择t在学术界有很多方法，我还没有好好去研究。

然后，如果d<sub>s</sub>中的第i个单词w<sub>i</sub>在这里选择了一个与原先不同的topic，就会对&theta;<sub>d</sub>和&phi;<sub>t</sub>有影响了（根据前面提到过的这两个向量的计算公式可以很容易知道）。它们的影响又会反过来影响对上面提到的p(w|d)的计算。对D中所有的d中的所有w进行一次p(w|d)的计算并重新选择topic看作一次迭代。这样进行n次循环迭代之后，就会收敛到LDA所需要的结果了。&nbsp;_【在这里突然想到了一个问题，就是对&theta;<sub>d</sub>和&phi;<sub>t</sub>这两个向量的更新究竟是在一次迭代对所有的d中的所有w更新之后统一更新（也就是在一次迭代中，&theta;<sub>d</sub>和&phi;<sub>t</sub>不变，统一在迭代结束时更新），还是每对一个d中的一个w更新topic之后，就马上对&theta;<sub>d</sub>和&phi;<sub>t</sub>进行更新呢？这个看来要去看一下那篇LDA最原始的论文了】_

#### 怎样计算p(w|t)和p(t|d)

待续&hellip;&hellip;

&nbsp;

#### 参考资料

【1】[Introduction to Latent Dirichlet Allocation](http://blog.echen.me/2011/08/22/introduction-to-latent-dirichlet-allocation/)：国外博客，很不错的入门文章
---
