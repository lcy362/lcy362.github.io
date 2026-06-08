---
title: Is Encapsulating All RPC Interface Inputs and Outputs into Classes a Sound Design?
description: "An in-depth analysis of wrapping RPC interface inputs and outputs into request/response classes, discussing when encapsulation is appropriate and when it becomes over-engineering."
keywords:
  - RPC
  - interface design
  - request
  - response
  - encapsulation
categories:
  - Architecture Design
tags:
  - design-pattern
abbrlink: 20888
cover: /img/20888.jpg
date: 2021-03-16 18:34:56
---
Regarding the inputs and outputs of RPC interfaces, there has long been a school of thought that advocates wrapping all inputs and outputs into individual request and response classes. In this article, we will analyze whether this approach constitutes a sound design.

Let's start with inputs. I'll state the conclusion first: encapsulation should only be done when there are excessive input parameters. In all other cases, there is absolutely no justification for encapsulation.

The reasons given for wrapping input parameters into a request class typically boil down to the following:

- Maintaining compatibility when interface parameters are modified
- Defining a generic abstract request class for unified management

First, the first point is a complete fallacy. The first time I encountered this claim, I was almost misled by it as well. But upon careful reflection, it becomes clear that this argument doesn't hold at all.

Even with a request body approach, if the interface provider adds a mandatory field, the caller still needs to include this parameter to make the call. Compared to passing parameters directly, this doesn't solve any problem. Furthermore, this kind of issue is fundamentally unsolvable because such situations should not arise in the first place. Interface providers have an obligation to ensure that subsequent modifications are forward-compatible. As for adding non-mandatory fields, even without wrapping in a request class, you can implement the new interface and maintain backward compatibility through an adapter pattern, and later asynchronously deprecate the old interface when the opportunity arises.

The second point does have some merit.

- For example, adding unified request parameters in an abstract class. I believe this is better handled in the framework layer rather than being exposed in business code.
- Another example is adding unified parameter validation. But if that's the only purpose, using an overly abstract class is inappropriate. Instead, each related business domain should have its own abstract class, since only that domain would have such requirements. Moreover, even without wrapping into a request class, such requirements are not difficult to implement, as the difficulty itself doesn't lie in non-uniform input structures.

The biggest problem with wrapping input parameters into a request class is that it destroys code readability and creates semantic ambiguity. A method like `queryById(long id)` has very clear semantics — a glance at the interface definition reveals the inputs and outputs. But after forced encapsulation, what inputs the interface actually requires becomes unclear. Additionally, if a request contains three parameters, can any combination of them return a result? This is also something you cannot determine just by looking at the interface. With normal parameter definitions, you can define a series of interfaces using the adapter pattern, making it easier for callers to understand.

The only condition for encapsulating input parameters is when there are too many parameters, and you need to use other means such as comments or documentation to specify the legal input values and upgrade strategies for the interface.

Now let's discuss outputs. Wrapping output results into a response body is somewhat more reasonable than wrapping input parameters, but it still shouldn't be used indiscriminately. The general purpose of wrapping output results is to add a return status code layer.

This essentially forces callers to understand the error conditions of the interface. We know that one of the fundamental design principles is the "Interface Segregation Principle," which states that clients should not be forced to depend upon interfaces that they do not use. The situation here is analogous: if callers genuinely don't care about the reasons for request success or failure, they shouldn't be forced to understand them. For example, if I just want to query a count, there are only two possibilities — found or not found — and I don't want to care about why it wasn't found.

Therefore, when designing interfaces, you need to carefully consider whether the error conditions of an interface should be information that is provided externally. Only on this basis can you determine whether wrapping in a response object is appropriate or not.

In summary, blindly wrapping all input and output parameters is never advisable. You must carefully consider when encapsulation is appropriate and when it is not. If you have any thoughts on this topic, feel free to discuss them with me.

Source: https://lichuanyang.top/en/posts/20888/
