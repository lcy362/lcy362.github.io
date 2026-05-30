---
title: "Kubernetes: A Practical Introduction"
description: "An introduction to Kubernetes from a developer's perspective, focusing on how to leverage K8s features to improve development efficiency, without focusing on deployment and architecture."
keywords:
  - Kubernetes
  - k8s
  - container orchestration
  - cloud native
  - getting started
categories:
  - Cloud Native
tags:
  - kubernetes
abbrlink: 55227
date: 2023-01-28 19:06:17
---

This tutorial will not focus on Kubernetes deployment, architecture, implementation, or other internal principles. Instead, it will introduce Kubernetes entirely from the perspective of a developer who uses Kubernetes, helping you understand how to better leverage its features.

<!-- more -->

## Basic Introduction

What is Kubernetes? A relatively official definition: Kubernetes is an open-source container orchestration platform that manages large-scale distributed containerized software applications, commonly abbreviated as K8s.

In simpler terms, the core concept of K8s is application-centric. It shields infrastructure differences downward and achieves application standardization through container images upward, helping developers build large-scale, reliable distributed applications while only needing to focus on the application itself without worrying about operational details like deployment, disaster recovery, and scaling.

## Advantages

As mentioned above, the core advantage of K8s is reducing operational costs, allowing application developers to focus on the application itself. Specifically, this includes:

- Convenient deployment workflows and large-scale replication and distribution capabilities: Applications provide standardized container images, and subsequent deployment workflows can be fully automated. Applications can also achieve cross-platform, cross-region deployment without additional effort.
- Self-healing capabilities: Automatically removes unhealthy nodes and performs recovery.
- Agile auto-scaling: Performs rapid auto-scaling based on configured system load, achieving a balance between system processing capacity and cost.

## Main Concepts and Implementation Approaches

The remainder of this Kubernetes tutorial will introduce the K8s concepts you need to understand from a developer's perspective, mainly including:

- Basic concepts like Pod, Service, and Deployment
- The basic implementation principle of spec + controller
- Extension points K8s provides for applications

## spec + controller

This is how most logic is implemented inside K8s. Understanding this logic can help developers better understand K8s behavior in certain situations.

If you look at K8s YAML configurations, you'll find that most K8s components have one or more spec fields. The meaning is straightforward — it represents the desired value for a certain attribute, such as the desired number of service nodes.

The controller's role is to continuously monitor whether the desired value matches the actual metrics. When they don't match, it takes corresponding actions. For example, if it detects that the number of nodes is insufficient, it will start the required number of new nodes.

This way, whether it's going live, scaling up/down, or recovering from failures, we find that the logic becomes very clear — it's all about triggering adjustments to the desired or actual container count, and then letting the controller add or remove nodes.

This mechanism is a widely used underlying design principle in K8s. Its purpose is to decouple monitoring logic from operational logic. For example, in many situations we need to trigger starting new nodes — when scaling up, when some nodes fail, when going live, etc. These completely unrelated scenarios all trigger the same operation. How do we keep the code clean? K8s uses the concept of a desired value as an intermediary layer, separating the trigger timing of operations from the operations themselves into independent logic.

Understanding this logic makes it easier to understand how K8s works. For example, HPA-based auto-scaling determines whether to increase or decrease nodes based on current CPU usage versus desired CPU usage.

## Deployment

Deployment tells K8s how to create and update applications. What we typically understand as a "service" or "application" generally corresponds to the Deployment layer. Various configurations like images, memory/CPU usage limits, number of nodes, environment variables, etc., are all on the Deployment.

## Pod

Pod is easy to understand — it's what we typically think of as a node. Pod is the smallest manageable unit in K8s.

## Service

Service is a concept that deserves special attention. It is an abstraction layer that selects Pods (container groups) with certain characteristics and defines an access method for them. In typical application scenarios, Deployment and Service correspond one-to-one, but in reality, there is no inherent connection between Deployment and Service.

A request hitting all Pods associated with a particular Deployment might seem perfectly normal. But in fact, this doesn't happen because these Pods were generated through a Deployment. Rather, it's because a label is configured on the Deployment, and all Pods generated by this Deployment inherit this label. At the same time, there exists a separate Service that selects Pods based on this label — requests enter through the batch of Pods selected by the Service.

## Probes and Hooks

K8s provides some interfaces for application extension, including probes and hooks, which help applications better leverage K8s capabilities.

K8s provides liveness and readiness probes. As the names suggest, the liveness probe determines whether an application is alive, while the readiness probe determines whether an application has finished starting.

Applications can provide probes through various forms such as HTTP endpoints, and K8s is responsible for taking different actions based on the detected states. For example, if a liveness probe returns an abnormal status, K8s can consider the node lost and delete it.

Hooks allow applications to insert behaviors at specific stages. For example, the preStop hook can run some operations before the application shuts down, which can be used for graceful shutdown.

## Practical Considerations

By understanding the concepts listed above in this Kubernetes tutorial, you should be able to fully understand what Kubernetes is from a developer's perspective, and roughly imagine the basic approach for using K8s: build standard images, expose necessary monitoring data, and leave the rest to K8s.

With accurate data, K8s can help us handle system self-healing, scaling, and other operations. What we need to do is, combined with application scenarios, provide as accurate monitoring data as possible.

For example, consider the liveness probes provided by applications — how can we ensure they accurately reflect the system's health status? Can an accessible endpoint or a connectable port equivalently indicate whether the application is healthy?

Another example: when K8s uses metrics like CPU and memory to determine system load, can these machine metrics truly reflect the application's real load? Is it possible that connection pools, I/O, or other bottlenecks will be reached before CPU and memory bottlenecks?

These are all aspects that application developers need to carefully design based on their specific application's characteristics.

Additionally, K8s's design philosophy means that in a K8s environment, "restarts" will be a very common occurrence. Various types of problems — hardware failures, low-probability infinite loops, unhealthy garbage collection, etc. — can all be self-healed through K8s's automatic restarts. During automatic scaling, nodes will also frequently start and stop. Therefore, applications need to have smooth startup processes, avoiding excessive time consumption or resource usage.

---

Source: https://lichuanyang.top/en/posts/55227/
