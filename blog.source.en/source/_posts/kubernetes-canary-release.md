---
title: A Canary Release Approach in Kubernetes
description: "A simple approach to canary release in Kubernetes, reducing deployment risk by gradually routing traffic to new versions."
keywords:
  - Kubernetes
  - canary release
  - gray release
  - container
  - deployment
categories:
  - Cloud Native
tags:
  - cloud-native
  - continuous-integration
  - canary
abbrlink: 30764
cover: /img/30764.jpg
faq:
  - q: "What's the difference between canary release, blue-green deployment, and rolling updates?"
  - q: "Can traffic be precisely controlled with this dual-Deployment approach?"
  - q: "What if I want to route by user dimension for canary releases?"
tldr: Simple K8s canary with dual Deployment + shared Service, no extra components
date: 2021-12-23 18:55:20
---
Canary release is actually a process well-suited for cloud-native environments, so I believe many people have the need to perform canary releases under Kubernetes. In this article, we introduce a very simple approach to canary release.

<!-- more -->

## What is Canary Release

First, let me introduce what a canary release is. The name "canary" originates from the fact that miners discovered canaries are very sensitive to gas. Before descending into the mine, miners would send a canary down first. If the canary stopped singing, it indicated a high concentration of gas.

In the context of systems, it means that after a release begins, a new version of the application is started first, but traffic is not switched over directly. Instead, testers perform online testing on the new version. The newly started application is our "canary." After testing on the canary shows no issues, the production traffic is then switched to the new version.

To be more specific, a domain name can be mapped to two groups of servers — one group is the production environment, and the other is the canary environment.

If we are not deploying with Kubernetes but directly deploying to multiple servers, canary deployment is very simple — just designate one or more machines as the canary.

However, in a Kubernetes environment, since Kubernetes manages the deployment process, we need to do something different to achieve this effect.

## Canary Release Approach in Kubernetes

A very simple approach is to create two Deployments that are associated with the same Service through labels. This distributes traffic from the same Service across two groups of containers. The two Deployments can be deployed independently, allowing different versions of images to be deployed.

## Deployment Configuration Example

For example, here are two Deployments:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.7.9
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
  labels:
    app: nginx
spec:
  selector:
    app: nginx
  ports:
  - name: nginx-port
    protocol: TCP
    port: 80
    nodePort: 32600
    targetPort: 80
  type: NodePort

```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment-canary
  labels:
    app: nginx
    track: canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
      track: canary
  template:
    metadata:
      labels:
        app: nginx
        track: canary
    spec:
      containers:
      - name: nginx
        image: nginx:1.8.0

```

The Service is only configured in the first Deployment, with a selector rule of `app: nginx`. Both Deployments have the `app: nginx` label applied.

This achieves the effect we described.

## Limitations

Of course, this approach only implements a very simple canary release process and cannot perform more granular routing, such as gray releases based on user information. For the same user, one request might go to the canary while the next goes to the production environment. If more fine-grained gray release rules are needed, consider using tools like Spring Cloud, Istio, etc.

## FAQ

### Q: What's the difference between canary release, blue-green deployment, and rolling updates?

- **Rolling Update**: Replaces old Pods batch by batch, with the new version going live gradually. It's the simplest, but during the brief period when old and new versions coexist, traffic is mixed, and rollback can only be done in reverse batch order.
- **Blue-Green Deployment**: Prepare a complete "green" environment with the new version, then switch all traffic once testing passes. Fast switching and fast rollback, but requires double the resources.
- **Canary Release**: Route a small portion of traffic to the new version (the canary) first, then gradually scale up after verification. The safest approach, but requires more fine-grained traffic control capabilities.

These three approaches are not mutually exclusive: canary can be seen as a "gradual version" of blue-green, and they are often combined in real-world projects.

### Q: Can traffic be precisely controlled with this dual-Deployment approach?

Traffic percentages cannot be precisely controlled. The Service balances load via kube-proxy's iptables/ipvs rules, defaulting to round-robin. The traffic ratio between the two Deployments roughly approximates the replica count ratio. For example, if you deploy 3 old Pods + 1 new Pod, about 25% of traffic goes to the new version — but this is only a statistical approximation, not precise control.

If you need precise traffic percentages (e.g., strictly 10% to canary), you'll need an Ingress Controller (such as Nginx Ingress's canary annotations) or a Service Mesh (such as Istio's VirtualService).

### Q: What if I want to route by user dimension for canary releases?

The approach described in this article is based on **traffic-percentage-based** simple canary releases and cannot route by user dimension (e.g., VIP users to the new version, internal employees to the new version). If you need user-dimension routing, consider:

- **Istio / Linkerd**: Route rules based on HTTP Headers (e.g., Cookie, User-Agent), enabling "requests with userId=xxx go to canary"
- **Spring Cloud Gateway**: Route based on request parameters at the gateway layer
- **Nginx Ingress canary-by-header**: Route to the canary service based on specific Header values

Original article: https://lichuanyang.top/posts/30764/

---
Source: https://lichuanyang.top/en/posts/30764/
