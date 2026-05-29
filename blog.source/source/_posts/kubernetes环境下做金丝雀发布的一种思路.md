---
title: kubernetes环境下做金丝雀发布的一种思路
description: "在 Kubernetes 环境下实现金丝雀发布的简单思路，通过逐步引流新版本来降低发布风险。"
tags:
  - 云原生
  - 持续集成
  - 金丝雀
abbrlink: 30764
date: 2021-12-23 18:55:20
---

金丝雀发布其实是一种非常适合在云原生体系下进行的流程，因此相信很多人有在kubernetes下做金丝雀发布的需求。通过本文，我们就介绍一种非常简单的做金丝雀发布的思路。

<!-- more -->

首先介绍一下金丝雀发布是什么，金丝雀这个名字，起源是，矿井工人发现，金丝雀对瓦斯气体很敏感，矿工会在下井之前，先放一只金丝雀到井中，如果金丝雀不叫了，就代表瓦斯浓度高。

在系统层面的具体含义就是，发布开始后，先启动一个新版本应用，但是并不直接将流量切过来，而是测试人员对新版本进行线上测试，启动的这个新版本应用，就是我们的金丝雀。在金丝雀上测试没有问题后，再将线上的流量切换到新版本上。

再具体点讲，可以将一个域名映射到两组服务器上，一组是正式的线上环境，另一组就可以是金丝雀环境了。

假如说我们不是用k8s做部署，而是直接部署到多台服务器上的话，金丝雀部署就很简单，任意指定一台或多台机器做金丝雀即可。

而在k8s环境下，由于k8s接管了部署的流程，我们就需要做一些别的事情来实现这个效果。

有一种很简单的思路，就是创建两个deployment, 但是通过label关联到同一个service上，就可以将同一个service的流量分配到两组容器中了。两个deployment可以分别部署，也就可以部署不同版本的镜像了。

例如下边两个deployment

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

只在第一个deployment中配置service，其配置的selector规则是app:nginx, 然后两个deployment都打上app:nginx的label.

这样就实现了我们所说的效果。

当然，这种方式只是实现了一种非常简单的金丝雀发布流程，是没有办法做更精细，比如说按用户信息去灰度的规则的。对于同一个用户，也有可能一次请求到了金丝雀中，下一次请求又到了正式环境中。假如需要更加精细的灰度规则，可以考虑采用spring cloud, istio等工具。

原文地址: http://lichuanyang.top/posts/30764/
