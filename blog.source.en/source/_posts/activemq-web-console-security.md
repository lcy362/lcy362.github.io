---
title: ActiveMQ Web Console Security Configuration
description: "Introduction to ActiveMQ Web Console permission management configuration based on Jetty, implementing access control for different user roles."
keywords:
  - ActiveMQ
  - Web Console
  - Jetty
  - permission management
categories:
  - message queue
tags:
  - activemq
  - monitoring
abbrlink: 32479
date: 2016-01-05 18:09:00
---
ActiveMQ's web console is built on Jetty, and its permission management is also based on Jetty. Based on requirements, different permissions can be assigned to different users. Jetty's permission management is fairly flexible, though it can be a bit cumbersome to configure. You can specify whether a particular role (role) has access to a specific page.

Below is a brief introduction to the configuration method. You only need to modify the following files under `/conf`: `jetty.xml` and `jetty-realm.properties`.

**1. jetty-realm.properties**

This file configures all users' usernames, passwords, and their associated roles, following this format:

```
username: password [,rolename ...]
```

**2. jetty.xml**

First, configure a Constraint class for each role, where the `roles` correspond to the role names in `jetty-realm.properties`:

```xml
<bean id="securityConstraint" class="org.eclipse.jetty.util.security.Constraint">
    <property name="name" value="BASIC" />
    <property name="roles" value="admin" />
    <property name="authenticate" value="true" />
</bean>
```

Then configure the `securityConstraintMapping`:

```xml
<bean id="securityConstraintMapping" class="org.eclipse.jetty.security.ConstraintMapping">
    <property name="constraint" ref="securityConstraint" />
    <property name="pathSpec" value="/admin/send.jsp/" />
</bean>
```

This means the role associated with `securityConstraint` can access the `/admin/send.jsp` page.

You can use `/*` to represent all pages that are **not individually configured**.

For example, suppose we need to create a read-only user. We can configure two roles: `admin` and `readonly`. Both roles need a `/*` ConstraintMapping entry, and then the `admin` role gets additional entries for all write-operation pages, including `/admin/deleteDestination.action/*`, `/admin/purgeDestination.action/*`, etc.

Finally, list all ConstraintMappings in the `constraintMappings` property of the `ConstraintSecurityHandler`:

```xml
<bean id="securityHandler" class="org.eclipse.jetty.security.ConstraintSecurityHandler">
    <property name="constraintMappings">
        <list>
            <ref bean="securityConstraintMapping" />
        </list>
    </property>
</bean>
```

This completes the permission configuration for ActiveMQ Web Console users.

---
Source: https://lichuanyang.top/en/posts/32479/
