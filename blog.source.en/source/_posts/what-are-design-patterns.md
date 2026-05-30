---
title: "What Exactly Are Design Patterns? A Deep Dive into Their Principles"
description: "Starting from the four fundamental characteristics of object-oriented programming, this article helps programmers truly understand the essence of design patterns and the right mindset for learning them."
keywords:
  - design patterns
  - object-oriented
  - solid
  - programming philosophy
categories:
  - architecture design
tags:
  - design patterns
abbrlink: 58527
date: 2021-03-04 19:26:30
---
Hello everyone, I'm Liusha. Design patterns are something every programmer encounters frequently, but I believe many people still have questions about what design patterns really are. So today, let's talk about this — the main goal is to help you understand the purpose of design patterns and the right mindset for approaching them.

<!-- more -->

## Prerequisites

When we mention design patterns, the first thing to understand clearly is object-oriented thinking. I believe that even if you can't describe it very precisely, you should already be fairly familiar with object-oriented programming.

Let me quickly review — object-oriented programming has four fundamental characteristics: encapsulation, abstraction, inheritance, and polymorphism.

**Encapsulation:** Exposes only limited interfaces, authorizing external access. Centralizes logic, making it more controllable; improves readability and maintainability; also enhances usability.

**Abstraction:** Hides the specific implementation of methods, so that callers only need to care about what functionality the method provides, without needing to know how those functions are implemented.

**Inheritance:** The benefit is code reuse.

**Polymorphism:** Subclasses can replace parent classes, improving code extensibility and reusability.

## What Are Design Patterns?

Design patterns are a set of practical solutions or design approaches summarized for frequently encountered design problems in software development, based on fundamental design principles.

As you can see, design patterns are very practice-oriented, more concrete and executable compared to design principles.

Therefore, before learning about design patterns, you need to understand some basic design principles. These principles are the key to guiding us to write good code.

So, what is good code?

## What Makes Good Code

This is actually quite hard to describe. We can try to summarize some characteristics of good code, such as:

Maintainable, extensible, readable, testable, reusable, and concise.

To achieve these standards, we need some basic design principles first.

## Fundamental Design Principles

## SOLID

### Single Responsibility Principle

The description is simple: a class should only be responsible for one task or function. But actually doing this well is quite difficult.

To determine what counts as a single responsibility, we can set some simple criteria, such as: too many lines of code; too many dependent classes; too many private methods; difficulty naming the class; too many methods in the class with concentrated functionality. However, there's no universal standard — you must consider the actual situation.

For example, consider this class:

```jsx
Student {
    int id;
		String name;
		String age;
		...
		String province;
		String city;
		String county;
		String detailAddress;
		...
}
```

There are at least four fields related to addresses. Should we extract the address-related responsibilities into a separate Address class?

Actually, it depends on the situation. If the address properties are just pure display information, then placing them directly in the Student class is fine. But if there's a complex logistics system behind them — meaning lots of complex logic related to addresses — then that part should be extracted separately.

In practice, we can start with a coarse-grained class to meet business requirements. As the business develops, if the coarse-grained class becomes increasingly large with more and more code, we can then split it into several finer-grained classes. This is called continuous refactoring.

### Open-Closed Principle

Open to extension, closed to modification.

Adding a new feature should be done by extending code on top of existing code (adding modules, classes, methods, properties, etc.), rather than modifying existing code (changing modules, classes, methods, properties, etc.).

The Open-Closed Principle is one of the harder principles to understand.

Questions like "What kind of code change is considered an 'extension'? What kind of code change is considered a 'modification'? How do we determine if the Open-Closed Principle is satisfied or violated? Does modifying code always mean violating the Open-Closed Principle?" are all difficult to answer.

Yet this principle is one of the most useful, because extensibility is one of the most important metrics for code quality.

In practice, we don't need to agonize over whether a code change is a "modification" or an "extension," nor worry too much about whether it violates the Open-Closed Principle. We should return to its original intent: as long as the existing code's behavior isn't broken, the Open-Closed Principle isn't violated. A simple criterion is: when functionality hasn't changed, if the corresponding unit tests aren't broken, the change satisfies the Open-Closed Principle.

How to achieve openness to extension while being closed to modification also requires gradual learning and accumulation. Among the 23 classic design patterns, most exist to solve code extensibility problems, primarily following the Open-Closed Principle.

When writing code, you can assume changes won't occur; when changes do arise, abstraction is needed to isolate future similar changes.

### Liskov Substitution Principle

Subclasses should be able to replace parent classes anywhere, while ensuring the original program's logical behavior remains unchanged and correctness isn't compromised.

The Liskov Substitution Principle has another more practical and instructive description: "Design By Contract." In this description, the relationship between subclasses and parent classes can be replaced with the relationship between interfaces and implementations. In other words, implementation classes cannot violate the functionality, inputs, outputs, exceptions, etc. that the interface declares it will provide.

### Interface Segregation Principle

> Clients should not be forced to depend upon interfaces that they do not use.

The core element is that an "interface" should have as focused a responsibility as possible. Callers should only depend on the parts they need, rather than depending on or calling the entire "interface."

Here, "interface" can refer to different meanings — for example, a set of API interfaces (i.e., a proxy we use).

For instance, in a project that handles business processes, generates data, and then needs to provide that data as a base service, you would provide two interfaces: one for processing internal processes and one as a base service for external access. This approach can help avoid accidental misuse to some extent.

You can also understand an interface as a single interface method, in which case it means each method should have a single responsibility.

The Interface Segregation Principle is somewhat similar to the Single Responsibility Principle, but there are slight differences. The Single Responsibility Principle targets the design of modules, classes, and interfaces. The Interface Segregation Principle, compared to the Single Responsibility Principle, focuses more on interface design. It provides a criterion for judging whether an interface has a single responsibility: indirectly determined by how callers use the interface. If callers only use part of the interface or some of its functionality, the interface design lacks a single responsibility.

### Dependency Inversion Principle

> High-level modules shouldn't depend on low-level modules. Both modules should depend on abstractions. In addition, abstractions shouldn't depend on details. Details depend on abstractions.

The division between high-level and low-level modules simply means that in the call chain, the caller belongs to the high level, and the callee belongs to the low level.

This principle is more targeted at framework development. In business development, high-level modules depending on low-level modules is actually perfectly fine.

Taking Tomcat as an example: Tomcat calls web programs to run, so Tomcat is the high-level module.

Tomcat and application code don't have direct dependencies on each other; both depend on the same "abstraction," which is the Servlet specification. The Servlet specification doesn't depend on specific Tomcat container or application implementation details, while the Tomcat container and application depend on the Servlet specification.

### KISS

Keep It Simple and Stupid.

Keep It Short and Simple.

Keep It Simple and Straightforward.

The KISS principle has different formulations, but they all convey roughly the same meaning: keep code as simple as possible.

"Simplicity" is actually very subjective. Code review is a good indirect way to evaluate whether code is simple. If colleagues reviewing your code find many parts hard to understand, the code is likely not simple enough.

Some simple tips: Don't reinvent the wheel; avoid over-engineering, whether for uncertain future extensibility or minor performance differences.

For example, many methods in StringUtils, in a specific scenario, could likely be implemented with better performance because the general concerns that StringUtils handles don't need to be considered in specific cases. But should we really do that?

### DRY Principle (Don't Repeat Yourself)

This principle is simple in itself, but note that the "repeat" here is different from simple code duplication. For example, two unrelated methods that happen to have identical implementations are not considered a DRY violation because semantically they're not duplicating. Conversely, two methods with completely different names and implementations — like `isValidIp()` and `checkIpValid()` — that do the same thing are also considered DRY violations.

Also note execution duplication, for example:

```jsx
void run1() {
	a();
	b();
}

void run2() {
	a();
	c();
}

main () {
	run1();
	run2();
}
```

Although the code appears well-encapsulated, when the `main` method is executed, method `a` is called twice. If `a` is a method with high overhead, this could be problematic.

### Law of Demeter

> Each unit should have only limited knowledge about other units: only units "closely" related to the current unit. Or: Each unit should only talk to its friends; Don't talk to strangers.

"High cohesion, loose coupling" is a relatively universal design concept that can guide the design and development of code at different granularities — systems, modules, classes, and functions.

High cohesion means that related functionality should be placed in the same class (module, system), while unrelated functionality should not be placed in the same class (module, system).

Loose coupling means that in code, the dependency relationships between classes (modules, systems) are simple and clear, depending only on what's necessary.

For example, qwerty's previous handling of homework-related logic required understanding the implementation details of each homework type, which was a violation of the Law of Demeter. The correct approach is to define a common model on the homework side, encapsulating the different logic of various homework types within the model, so qwerty only needs to understand this model.

For these design principles, there's no need to spend too much effort on the exact wording. What's more important is understanding their underlying ideas — understanding why these principles help us write code that is "maintainable, extensible, readable, testable, reusable, and concise."

Next, we can talk specifically about design patterns.

## Common Design Patterns

There are 23 classic design patterns. With the evolution of programming languages, some design patterns (like Singleton) have become outdated or even anti-patterns, some have been built into programming languages (like Iterator), and some new patterns have emerged (like Monostate).

**Creational Patterns (5):** Factory Method, Abstract Factory, Singleton, Builder, Prototype.

**Structural Patterns (7):** Adapter, Decorator, Proxy, Facade, Bridge, Composite, Flyweight.

**Behavioral Patterns (11):** Strategy, Template Method, Observer, Iterator, Chain of Responsibility, Command, Memento, State, Visitor, Mediator, Interpreter.

Let's focus on some of the more important ones.

## Simple Factory & Factory Method

For example, consider a feature that creates different parsers based on file format to read configuration into `RuleConfig`. The Simple Factory implementation looks like this:

```java
public class RuleConfigSource {
  public RuleConfig load(String ruleConfigFilePath) {
    String ruleConfigFileExtension = getFileExtension(ruleConfigFilePath);
    IRuleConfigParser parser = RuleConfigParserFactory.createParser(ruleConfigFileExtension);
    if (parser == null) {
      throw new InvalidRuleConfigException(
              "Rule config file format is not supported: " + ruleConfigFilePath);
    }

    String configText = "";
    //从ruleConfigFilePath文件中读取配置文本到configText中
    RuleConfig ruleConfig = parser.parse(configText);
    return ruleConfig;
  }

  private String getFileExtension(String filePath) {
    //...解析文件名获取扩展名，比如rule.json，返回json
    return "json";
  }
}

public class RuleConfigParserFactory {
  public static IRuleConfigParser createParser(String configFormat) {
    IRuleConfigParser parser = null;
    if ("json".equalsIgnoreCase(configFormat)) {
      parser = new JsonRuleConfigParser();
    } else if ("xml".equalsIgnoreCase(configFormat)) {
      parser = new XmlRuleConfigParser();
    } else if ("yaml".equalsIgnoreCase(configFormat)) {
      parser = new YamlRuleConfigParser();
    } else if ("properties".equalsIgnoreCase(configFormat)) {
      parser = new PropertiesRuleConfigParser();
    }
    return parser;
  }
}
```

This creates a factory class specifically for "producing" parsers.

Placing the parser creation logic directly in the `load` method would also work. The reason to separate it out is to isolate the creation logic. Therefore, the factory pattern is only used when the creation logic is complex.

The above implementation can be further optimized to eliminate the large number of if-else statements:

```java
public class RuleConfigSource {
  public RuleConfig load(String ruleConfigFilePath) {
    String ruleConfigFileExtension = getFileExtension(ruleConfigFilePath);

    IRuleConfigParserFactory parserFactory = RuleConfigParserFactoryMap.getParserFactory(ruleConfigFileExtension);
    if (parserFactory == null) {
      throw new InvalidRuleConfigException("Rule config file format is not supported: " + ruleConfigFilePath);
    }
    IRuleConfigParser parser = parserFactory.createParser();

    String configText = "";
    //从ruleConfigFilePath文件中读取配置文本到configText中
    RuleConfig ruleConfig = parser.parse(configText);
    return ruleConfig;
  }

  private String getFileExtension(String filePath) {
    //...解析文件名获取扩展名，比如rule.json，返回json
    return "json";
  }
}

//因为工厂类只包含方法，不包含成员变量，完全可以复用，
//不需要每次都创建新的工厂类对象，所以，简单工厂模式的第二种实现思路更加合适。
public class RuleConfigParserFactoryMap { //工厂的工厂
  private static final Map<String, IRuleConfigParserFactory> cachedFactories = new HashMap<>();

  static {
    cachedFactories.put("json", new JsonRuleConfigParserFactory());
    cachedFactories.put("xml", new XmlRuleConfigParserFactory());
    cachedFactories.put("yaml", new YamlRuleConfigParserFactory());
    cachedFactories.put("properties", new PropertiesRuleConfigParserFactory());
  }

  public static IRuleConfigParserFactory getParserFactory(String type) {
    if (type == null || type.isEmpty()) {
      return null;
    }
    IRuleConfigParserFactory parserFactory = cachedFactories.get(type.toLowerCase());
    return parserFactory;
  }
}
```

This is the Factory Method Pattern. The Factory Method Pattern essentially creates a simple factory for the factory class — a factory of factories — to create factory class objects.

The principles and implementations of the factory pattern are quite simple. In practice, there are many details worth exploring, but we won't go into them here. The key point we need to understand is when to use this pattern and what problem it solves.

For the factory pattern, the application scenario is when the creation logic is complex — for example, when there are lots of if-else statements to dynamically decide what object to create; or when creating a single object itself is a complex process and the caller doesn't need to know how to create it.

## Builder

The Builder Pattern is widely used. If you open any project, you'll find many `XXXBuilder` classes.

The Builder Pattern is used when a class has multiple configurable options and the user can freely choose which ones to configure.

If you try to achieve this with different constructors, you'd face an endless number of combinations.

And if you use setter methods for configuration, the class completely loses control over its configuration options — callers can invoke setters anytime, anywhere. Additionally, if you need to perform validation after configuration is complete, this approach can't accommodate that.

The solution for this situation is the Builder Pattern:

```java
ResourcePoolConfig config = new ResourcePoolConfig.Builder()
 .setName("dbconnectionpool") 
 .setMaxTotal(16) 
 .setMaxIdle(10) 
 .setMinIdle(12)
 .build();
```

The implementation is relatively straightforward.

The factory pattern is used to create a family of related but different objects, while the Builder Pattern is used to customize the same object in different ways.

## Singleton

As for what a singleton is and how to implement one — as a classic interview question — I won't elaborate further. I'll only discuss the problems with singletons and why they've gradually become an anti-pattern.

Problems with singletons:

- Hidden dependencies between classes;
- Dependencies point directly to singleton implementations, violating the principle of depending on interfaces rather than implementations;
- Poor testability: cannot be mocked (in Mockito); global state can cause tests to interfere with each other;
- Doesn't support parameterized constructors.

However, the advantage of the Singleton Pattern is that in some scenarios, it's simpler and more convenient to use. So there's no need to categorically rule out using singletons.

## Proxy & Decorator

The Proxy Pattern has the proxy class implement the same interface as the target class, responsible for adding additional logic before and after business code execution (such as performance monitoring, counting, etc.), then delegating to the target class to complete the business function, thereby achieving decoupling between business code and framework code.

The Decorator Pattern achieves functionality enhancement through inheritance of the decorated class. For example, Java's `InputStream` series of classes are applications of the Decorator Pattern.

At the implementation level, the Proxy Pattern and Decorator Pattern are almost identical, but their intents differ.

In the Proxy Pattern, the proxy class adds functionality unrelated to the original class, while in the Decorator Pattern, the decorator class adds enhanced functionality related to the original class.

Again, for design patterns, there's no need to nitpick about what each pattern exactly is. As long as you know such a technique exists and can handle similar scenarios, that's sufficient.

## Adapter

The Adapter Pattern is straightforward — let's look at an example directly.

```java
public void debug(String msg) { 
	logger.log(FQCN, Level.DEBUG, msg, null); 
} 

public void debug(String format, Object arg) { 
	if (logger.isDebugEnabled()) { 
		FormattingTuple ft = MessageFormatter.format(format, arg); 
		logger.log(FQCN, Level.DEBUG, ft.getMessage(), ft.getThrowable()); 
	} 
}
```

Application scenarios include:

- Maintaining backward compatibility with old interfaces;
- Handling different inputs;
- Wrapping flawed interface designs;
- ...

## Facade

The Facade Pattern provides a unified set of interfaces for subsystems, defining a set of high-level interfaces to make subsystems easier to use. This mainly concerns how large an interface's granularity should be, balancing the generic usability and ease of use of interfaces.

Typically, interfaces with smaller granularity will have better generic usability, but callers would need to invoke multiple methods, which is inevitably less convenient. Conversely, if the interface granularity is too large, there will be insufficient generic usability.

The Facade Pattern solves this problem. I work in online education, and one scenario is displaying various types of questions on the B-side — for example, pre-class questions, in-class questions, and post-class questions. Each category has many specific types, and each type has different data sources.

Here, we need to balance the generic usability and practical usability of interfaces. The Facade Pattern perfectly addresses our problem. First, we define a common model including question stems, reference answers, user responses, etc., then implement a set of interfaces for specific types. On top of that, based on business scenarios, we encapsulate some facade layers that simply combine data from the subsystems.

## Strategy

Define a family of algorithm classes, encapsulate each algorithm separately, and allow them to be interchangeable.

The implementation involves defining a strategy interface and a set of strategies implementing this interface. At runtime, which strategy to execute can be dynamically chosen based on certain conditions.

## Template Method

The Template Method Pattern defines an algorithm skeleton in one method and defers certain steps to subclasses for implementation. The Template Method Pattern allows subclasses to redefine certain steps of the algorithm without changing its overall structure.

For example, Java's `AbstractList.addAll` method is a template method:

```java
public boolean addAll(int index, Collection<? extends E> c) {
    rangeCheckForAdd(index);
    boolean modified = false;
    for (E e : c) {
        add(index++, e);
        modified = true;
    }
    return modified;
}

public void add(int index, E element) {
    throw new UnsupportedOperationException();
}
```

## Observer

Define a one-to-many dependency between objects. When one object's state changes, all dependent objects are automatically notified. This is also known as the publish-subscribe pattern.

The Observer Pattern is a relatively abstract pattern. Depending on different application scenarios and requirements, there are completely different implementation approaches. But the underlying idea is easy to understand, so I won't include code here. Our use of message queues (MQ) is essentially using the Observer Pattern.

## Chain of Responsibility

Decouple the sending and receiving of requests, allowing multiple receivers the opportunity to handle a request. String these receivers into a chain and pass the request along the chain until a receiver on the chain can handle it.

In practice, a variant of the Chain of Responsibility Pattern is also widely used — where every receiver on the chain processes the request.

For example, we have a data assembly logic that's an application of the Chain of Responsibility variant:

```java
private boolean fillUserDataCollection(Map<Integer, UserDataCollection> userExpandMap, Map<Integer, UserDataCollection> originUserExpandMap) {
        return !fillingServices
                .stream()
                .map(filler -> filler.fillUserDataWithFallback(userExpandMap, originUserExpandMap))
                .collect(toSet())
                .contains(false);
    }
```

`UserDataCollection` contains many fields, and each `fillingService` is responsible for supplementing a portion of the data.

The core idea of the Chain of Responsibility is decomposition — breaking large classes into smaller ones. This is also one of the important means of managing code complexity.

## Summary

For writing good code, the most critical thing is to first build a mental awareness of what good code is and have the desire to write good code. On top of that, you need a thorough understanding of object-oriented thinking and various design principles, knowing why good code should adhere to these principles.

In practice, the best way to write good code is continuous refactoring. When business development is still unclear at the beginning, it's normal that code can't be designed perfectly. As the business develops, we gradually realize the problems in our code. At this point, we can look through design patterns for ready-made solutions and apply them to our own projects.

Finally, I should mention that much of the content in this article actually comes from the Geek Time column "The Beauty of Design Patterns." I think this is the best column on design patterns and recommend checking it out.

![design](/img/design.jpg)

Source: https://lichuanyang.top/en/posts/58527/
