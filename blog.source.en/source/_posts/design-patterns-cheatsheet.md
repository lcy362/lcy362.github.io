---
title: "Design Patterns Cheatsheet"
description: "A quick reference guide for design patterns, describing the core concepts, typical scenarios, and key English terminology for all 23 patterns in concise language."
keywords:
  - design patterns
  - 23 patterns
  - object-oriented
  - cheatsheet
categories:
  - architecture design
tags:
  - design patterns
abbrlink: 21897
date: 2020-04-08 18:06:51
---
As everyone knows, design patterns are an extremely important discipline for programmers. However, because design patterns cover such a broad scope and involve many abstract concepts, they can be quite difficult to master. The best way to learn design patterns is to combine them with practical experience. Every time you work on a requirement — especially complex ones, or when you detect signs of smelly code — you can flip through the design patterns to see which ones might apply. Therefore, I've summarized this article using the most concise language to describe the main design patterns, possibly the key parts of their definitions, typical application scenarios, or just an English term. The goal is to help recall the purpose and application scenarios of each design pattern.

<!-- more -->

## Basic Design Principles

Before discussing design patterns, we must first go over the six fundamental design principles. Simply put, design patterns are a series of best practices distilled from these principles.

## Single Responsibility Principle

## Open-Closed Principle

Solve problems through extension rather than modifying existing implementations. (When writing code, you can assume changes won't occur; when changes do arise, abstraction is needed to isolate future similar changes.) As long as modifications don't break existing unit tests, the Open-Closed Principle is not violated.

## Liskov Substitution Principle

Subclasses should be able to substitute for their parent classes.

## Dependency Inversion Principle

High-level modules should not depend on low-level modules; both should depend on abstractions rather than implementations.

## Interface Segregation Principle

Interfaces should be as small as possible.

## Law of Demeter

Decouple classes from each other.

# Design Patterns

## Factory Method Pattern

Define an interface for creating an object.

## Abstract Factory Pattern

Create a family of related or interdependent objects.

## Singleton Pattern

A class has only one instance.

## Builder Pattern

Build each module of an instance separately.

## Prototype Pattern

Copy objects.

## Adapter Pattern

Handle interface incompatibility.

## Decorator Pattern

Dynamically add additional responsibilities to an object, more flexible than creating subclasses.

## Proxy Pattern

Provide a proxy for some objects to restrict access to other objects.

## Facade Pattern (facade)

The facade contains some or all methods of several subsystems, combining the subsystems and providing them externally.

## Bridge Pattern

Separate the abstraction from the implementation. An abstract class depends on an interface, and both parts can be extended independently.

## Composite Pattern

Treat a group of similar objects as a single object.

## Flyweight Pattern

Shared objects — database connection pools, thread pools, etc. are all applications of the flyweight pattern.

## Strategy Pattern

Dynamically switch between multiple different "strategies" to change an object's behavior.

## Template Method Pattern

The parent class defines the skeleton of the algorithm, with some details implemented by subclasses.

## Observer Pattern

For one-to-many dependencies, when an object's state changes, all objects that depend on it are notified.

## Iterator Pattern

Provide objects with an iterator.

## Chain of Responsibility Pattern

Multiple objects have the opportunity to handle a request, connected in a chain. The request is passed along the chain until one of the objects handles it.

## Command Pattern

Pass client requests into an object, achieving decoupling between the "behavior requester" and the "behavior implementer."

## Memento Pattern

A memento object is an object used to store a snapshot of another object's internal state.

## State Pattern

State machine.

## Visitor Pattern

Separate data structures from data operations.

## Mediator Pattern

Encapsulate a series of object interactions using a mediator object. The mediator makes objects interact without explicit references to each other.

## Interpreter Pattern

Given a language, define a representation of its grammar and define an interpreter that uses this representation to interpret sentences in the language. Typical scenarios include SQL parsing, etc.

Source: https://lichuanyang.top/en/posts/21897/
