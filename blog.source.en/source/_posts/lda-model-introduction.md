---
title: A Great Introduction to the LDA Model
description: "LDA (Latent Dirichlet Allocation) topic model introductory learning notes, helping to understand the basic concepts and application scenarios of LDA."
keywords:
  - LDA
  - topic model
  - natural language processing
  - machine learning
categories:
  - Tech Miscellany
tags:
  - lda
  - big-data
abbrlink: 63299
tldr: "The LDA topic model uses a three-layer probabilistic modeling of documents-topics-words and iterative learning to output topic distributions for documents and keyword distributions for topics, achieving unsupervised text clustering."
cover: /img/63299.jpg
date: 2012-12-02 15:20:00
---
Reposted from [http://leyew.blog.51cto.com/5043877/860255#559183-tsina-1-46862-ed0973a0c870156ed15f06a6573c8bf0](http://leyew.blog.51cto.com/5043877/860255#559183-tsina-1-46862-ed0973a0c870156ed15f06a6573c8bf0)

A few days ago I started learning LDA, took many detours, and was still completely confused about LDA. After reading this document, I finally understood what LDA is for.

&nbsp;

### LDA (Latent Dirichlet Allocation) Learning Notes

I've been studying the LDA algorithm recently, and after a few days of struggle, I've finally gained a rough understanding of the overall framework and process of this algorithm.

#### Example

What LDA does in simple terms is cluster a bunch of documents (so it's unsupervised learning), where each topic represents a category, and the number of topics to cluster into is specified in advance. The clustering result is a probability, not a boolean 100% belonging to a certain category. A foreign blog [1] has a clear example, directly cited:

> Suppose you have the following set of sentences:
> 
> *   I like to eat broccoli and bananas.
> *   I ate a banana and spinach smoothie for breakfast.
> *   Chinchillas and kittens are cute.
> *   My sister adopted a kitten yesterday.
> *   Look at this cute hamster munching on a piece of broccoli.
> 
> 
> What is latent Dirichlet allocation? It's a way of automatically discovering topics that these sentences contain. For example, given these sentences and asked for 2 topics, LDA might produce something like
> 
> *   **Sentences 1 and 2**: 100% Topic A
> *   **Sentences 3 and 4**: 100% Topic B
> *   **Sentence 5**: 60% Topic A, 40% Topic B
> *   **Topic A**: 30% broccoli, 15% bananas, 10% breakfast, 10% munching, … (at which point, you could interpret topic A to be about food)
> *   **Topic B**: 20% chinchillas, 20% kittens, 20% cute, 15% hamster, … (at which point, you could interpret topic B to be about cute animals)

Looking at the result for sentence 5, we can see it's clearly a probabilistic clustering result (sentences 1 and 2 happen to be 100% deterministic results).

Looking at the results in the example, besides obtaining a probabilistic clustering result for each sentence, each topic has representative words with proportions. Taking Topic A as an example, it means that among all words corresponding to Topic A, 30% of them are "broccoli". In the LDA algorithm, every word in every document is mapped to a Topic, so this proportion can be calculated. These words serve as good guidance for describing this Topic, which I think is the advantage of LDA over traditional text clustering.

#### LDA Overall Process

First, let's define the meaning of some letters:

*   Document collection **D**, topic collection **T**
*   Each document d in D is viewed as a word sequence **< w1, w2, ..., wn >**, where wi represents the i-th word, and d has n words. (In LDA this is called a _word bag_, where the actual position of each word has no effect on the LDA algorithm)
*   All different words involved in D form a large collection **VOCABULARY** (abbreviated as **VOC**)

LDA takes document collection D as input (with common preprocessing steps like tokenization, stop word removal, and stemming omitted), and hopes to train two result vectors (**assuming clustering into k Topics, with m words in VOC**):

*   **For each document d in D, the probability of mapping to different topics θ<sub>d</sub> < p<sub>t1</sub>,..., p<sub>tk</sub> >**, where p<sub>ti</sub> represents the probability that d maps to the i-th topic in T. The calculation method is intuitive: p<sub>ti</sub> = n<sub>ti</sub>/n, where n<sub>ti</sub> represents the number of words in d that correspond to the i-th topic, and n is the total number of words in d.
*   **For each topic t in T, the probability of generating different words φ<sub>t</sub> < p<sub>w1</sub>,..., p<sub>wm</sub> >**, where p<sub>wi</sub> represents the probability of t generating the i-th word in VOC. The calculation method is equally intuitive: p<sub>wi</sub> = N<sub>wi</sub>/N, where N<sub>wi</sub> represents the number of times the i-th word in VOC corresponds to topic t, and N represents the total number of words that correspond to topic t.

The core formula of LDA is as follows:

**p(w|d) = p(w|t)*p(t|d)**

Intuitively, this formula uses Topic as an intermediate layer, and through the current θ<sub>d</sub> and φ<sub>t</sub>, gives the probability of word w appearing in document d. Here, p(t|d) is calculated using θ<sub>d</sub>, and p(w|t) is calculated using φ<sub>t</sub>.

In practice, using the current θ<sub>d</sub> and φ<sub>t</sub>, we can calculate p(w|d) for a word in a document when it maps to any Topic, and then based on these results, update which topic this word should correspond to. Then, if this update changes the topic the word corresponds to, it will in turn affect θ<sub>d</sub> and φ<sub>t</sub>.

When the LDA algorithm starts, it first randomly assigns values to θ<sub>d</sub> and φ<sub>t</sub> (for all d and t). Then the above process is repeated continuously, and the final converged result is the output of LDA.

Let me elaborate more on this iterative learning process:

For the i-th word w<sub>i</sub> in a specific document d<sub>s</sub>, if we let the topic corresponding to this word be t<sub>j</sub>, we can rewrite the above formula as:

_p<sub>j</sub>(w<sub>i</sub>|d<sub>s</sub>) = p(w<sub>i</sub>|t<sub>j</sub>)*p(t<sub>j</sub>|d<sub>s</sub>)_

Let's ignore how this value is calculated for now (you can first understand it as directly taking the corresponding terms from θ<sub>ds</sub> and φ<sub>tj</sub>. Actually it's not that simple, but it doesn't affect understanding the overall LDA process, which will be discussed later.). Now we can enumerate all topics in T, obtaining all p<sub>j</sub>(w<sub>i</sub>|d<sub>s</sub>), where j ranges from 1 to k. Then based on these probability values, we can select a topic for the i-th word w<sub>i</sub> in d<sub>s</sub>. The simplest approach is to choose the t<sub>j</sub> that maximizes p<sub>j</sub>(w<sub>i</sub>|d<sub>s</sub>) (note that j is the only variable in this expression), i.e.,

_argmax[j] p<sub>j</sub>(w<sub>i</sub>|d<sub>s</sub>)_

Of course, this is just one method (and it doesn't seem to be commonly used). In practice, there are many methods in academia for choosing t here, which I haven't thoroughly researched yet.

Then, if the i-th word w<sub>i</sub> in d<sub>s</sub> selects a different topic than before, it will affect θ<sub>d</sub> and φ<sub>t</sub> (as can be easily seen from the calculation formulas of these two vectors mentioned earlier). Their effects will in turn affect the calculation of p(w|d) mentioned above. Performing one calculation of p(w|d) for all w in all d in D and reselecting topics is considered one iteration. After n such iterations, the result required by LDA will converge. _[Here I suddenly thought of a question: whether the updates to θ<sub>d</sub> and φ<sub>t</sub> are done uniformly after updating all w in all d in one iteration (meaning within one iteration, θ<sub>d</sub> and φ<sub>t</sub> remain unchanged, and are updated uniformly at the end of the iteration), or whether θ<sub>d</sub> and φ<sub>t</sub> are updated immediately after each w in each d has its topic updated? This seems to require looking at the original LDA paper.]_

#### How to Calculate p(w|t) and p(t|d)

To be continued...

&nbsp;

#### References

[1] [Introduction to Latent Dirichlet Allocation](http://blog.echen.me/2011/08/22/introduction-to-latent-dirichlet-allocation/): A foreign blog, a great introductory article
---
Source: https://lichuanyang.top/en/posts/63299/
