---

title: "What Exactly is Cloud Native?"
description: "Starting from the literal meaning of Cloud Native, systematically organizing the definition, core concepts, and technology ecosystem of cloud native."
keywords:
  - cloud native
  - cloud native
  - microservices
  - containerization
  - DevOps
categories:
  - Cloud Native
tags:
  - microservices
  - cloud-native-architecture
abbrlink: 42843
date: 2021-06-09 19:54:37
top_img: /img/cloud-native-arch.jpg
cover: /img/cloud-native-arch.jpg
faq:
  - q: "Is cloud native just about adopting Kubernetes?"
  - q: "Is it necessary to migrate legacy applications to cloud native?"
  - q: "What's the difference between containerization and virtualization?"
  - q: "What's the relationship between microservices and cloud native?"

---



## Definition of Cloud Native

In recent years, cloud native has become an increasingly popular concept across the open-source community. But what exactly is cloud native? Is it an architecture? A platform? What does it affect? System security? Development efficiency? So today, let's dig deep and sort out what cloud native really is.

<!-- more -->

To understand what cloud native is, we need to start with its name. The English name for cloud native is "cloud native," which obviously contains two parts: cloud and native. Cloud means the application runs in the cloud, not locally. Native means the application should run in the way best suited for the cloud, not just be migrated from local to the cloud.

So what kind of application is suited for the cloud? It's one that maximizes the use of cloud capabilities and leverages the advantages of the cloud.

The core advantage of cloud computing is essentially just centralizing more resources for unified management and allocation, making it more convenient to flexibly allocate resources on demand and improve resource utilization.

By analogy, many people have used streaming frameworks like Storm. What are their advantages? One important factor is the ability to break down a complex workflow into multiple sub-nodes, where each node can be configured with different levels of concurrency based on its needs. Nodes with higher concurrency demands can receive more resources. This way, resource utilization is improved.

## Microservices

For microservices, it's similar — splitting different functions into separate services allows independent scaling at a finer granularity.

It's worth noting that splitting includes not only separating different business domains, but also separating business code, third-party software (third-party libraries), and non-functional features (high availability, security, observability, etc.) into three distinct categories.

Pure business splitting has actually been happening since very early stages of software development. The trend accompanying the rise of cloud native is to maximize the separation of non-business code portions from cloud applications, allowing cloud infrastructure to take over the many non-functional features originally in applications (such as elasticity, resilience, security, observability, canary releases, etc.) — this is the so-called service mesh.

Since resources and applications in the cloud are not strongly bound, to make resource utilization more convenient, we need a more universal runtime format that allows applications to have a certain degree of decoupling from their runtime environment. 

## Containerization

This is container technology. Containers provide a logical packaging mechanism. Applications packaged with this mechanism can operate independently of their actual runtime environment. Using this decoupling, regardless of whether the target environment is a private data center, public cloud, or a developer's personal laptop, you can easily and consistently deploy container-based applications. Containerization makes the concerns of developers and IT operations teams distinct — developers focus on application logic and dependencies, while IT operations teams can focus on deployment and management without being distracted by specific software versions and application-specific configurations.

## Observability

On the other hand, after splitting services into finer granularity, the system's inherent complexity obviously increases. For example, local calls become network requests, and call chains cannot be reflected through code structure. Therefore, operations need to be more intelligent and automated to ensure stronger stability of individual services. At the same time, a powerful monitoring system is needed that can analyze dependencies between microservices and quickly detect anomalies in the system.

Furthermore, with smaller individual services and comprehensive monitoring data, we can deploy more frequently, even deploying directly to production after each change. If a deployment has issues, we can detect them promptly through monitoring, thereby controlling losses to a minimum. Small-scale deployments also make it easier to locate problems or roll back.

From the analysis above, we can organize some keywords related to cloud native, such as service-oriented, elastic, observable, resilient, automated, etc. These keywords can be summarized into four categories: microservices, DevOps, continuous delivery, and containerization.

The key characteristics of these four categories are:

Microservices: Can be independently deployed, updated, restarted, and scaled

DevOps: Automated, rapid, development-operations collaboration

Continuous delivery: Frequent releases, fast feedback

Containerization: Logical packaging mechanism

## Cloud Native Mindset

We've covered a lot of theory above. So what are the concrete implementation paths for adopting cloud native? We can consider the following aspects:

1. Business service splitting: This is a very fundamental thing in software development. Splitting needs to follow basic design principles like SOLID.
2. Comprehensive monitoring system: Including collecting information across log, trace, metric, and alert dimensions. Logs focus on recording information during code execution, traces are mainly for tracking the flow of the same request across different services, metrics are for monitoring system runtime status, and alerts are for anomaly notifications. The industry already has many open-source implementations, such as Prometheus, Jaeger, etc.
3. Containers and container orchestration: This basically means Docker and K8s.
4. Middleware mesh化: Business applications only retain a thin client layer, with the main logic in the middleware placed at the mesh layer.
5. DevOps and continuous delivery: This mainly involves development workflows and many process-related aspects of development-operations collaboration. In a cloud environment, we advocate a pattern of small batches, frequent releases, and fast feedback.

I am Liu Sha. I hope this article can help everyone better understand what exactly cloud native is. Actually, cloud native is simple to describe — it's about adopting various approaches to better utilize cloud resources. But when explained in detail, it's a very comprehensive system covering everything from development to operations. Welcome to follow my WeChat public account (Mobility), or visit my [personal website](https://lichuanyang.top/). I will gradually expand on all aspects of cloud native in future articles.

## FAQ

### Q: Is cloud native just about adopting Kubernetes?

No. Kubernetes is the core container orchestration tool in the cloud native ecosystem, but cloud native goes far beyond K8s. Cloud native is a comprehensive methodology covering microservices architecture, containerization, DevOps, continuous delivery, observability, and more. Running on K8s doesn't automatically mean you're "cloud native" — if your application is still a monolithic blob, with no automated CI/CD, no monitoring or alerting, then you're simply "running a traditional application on K8s."

### Q: Is it necessary to migrate legacy applications to cloud native?

It depends on the context. If the application is small in scale, has a low iteration frequency, and a small team, forcing a full cloud native adoption will only add complexity. But if the application needs frequent iteration, elastic scaling, high availability, or the team is large enough to warrant microservice decomposition — that's when cloud native delivers value. In short: don't adopt cloud native for its own sake; adopt it to solve real problems.

### Q: What's the difference between containerization and virtualization?

Virtual machines (VMs) virtualize at the hardware layer — each VM has its own OS kernel, with slow startup and significant resource overhead. Containers virtualize at the OS layer — all containers share the host kernel, isolating only the application and its dependencies, with fast startup (seconds) and minimal resource footprint. A simple analogy: VMs are like "each household has its own kitchen in an apartment building," while containers are like "sharing one large kitchen, each person having their own stove."

### Q: What's the relationship between microservices and cloud native?

Microservices are a core component of cloud native architecture, but not the whole picture. Microservices address "how to split applications for independent deployment and scaling," while cloud native also encompasses "how these microservices run" (containers and orchestration), "how they are delivered" (CI/CD), "how they are monitored" (observability), "how they communicate" (Service Mesh), and more. Think of microservices as the "business layer" of cloud native architecture.

Original article: https://lichuanyang.top/posts/42843/

