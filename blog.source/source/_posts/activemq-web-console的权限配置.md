---
title: activemq web console的权限配置
description: "介绍 ActiveMQ Web Console 基于 Jetty 的权限管理配置方法，实现不同用户角色的访问控制。"
keywords:
  - ActiveMQ
  - Web Console
  - Jetty
  - 权限管理
categories:
  - 消息队列
tags:
  - activemq
  - 监控
abbrlink: 32479
cover: /img/32479.jpg
date: 2016-01-05 18:09:00
---
## Web Console 的安全风险

<div>activemq的web console是基于jetty实现，其权限管理也是基于jetty. 根据需求，可以给不同的用户赋予不同的权限。jetty的权限管理还算灵活，虽然配起来比较麻烦，可以分别设定某个角色（role）下的用户是否有对某个页面的访问权限。</div>

## JAAS 认证配置

<div>下面简要介绍一下配置方法，只需要修改/conf 下的&nbsp;jetty.xml，&nbsp;jetty-realm.properties</div>
<div>1.&nbsp;jetty-realm.properties</div>
<div>&nbsp; 这里面配置了所有用户的用户名，密码和所属角色，按照如下格式：</div>
<div>username: password [,rolename ...] &nbsp;&nbsp;</div>
<div>

</div>
## 角色与权限定义

<div>2\. jetty.xml</div>
<div>首先对每个角色配置一个Constraint 类，其中roles及对应&nbsp;jetty-realm.properties中的rolename</div>
<div>

</div>
<table>
<tbody>
<tr>
<td style="border-style: solid; border-width: 1px; border-color: #d3d3d3; padding: 10px; margin: 0px; width: 100%;">
<div>&lt;bean id="securityConstraint" class="org.eclipse.jetty.util.security.Constraint"&gt;</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;property name="name" value="BASIC" /&gt;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;property name="roles" value="admin" /&gt;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;property name="authenticate" value="true" /&gt;</div>
<div>&nbsp;&nbsp;&nbsp; &lt;/bean&gt;</div>

</td>

</tr>

</tbody>

</table>
<div>

</div>
<div>

</div>
<div>然后配置securityConstraintMapping,&nbsp;</div>
<table>
<tbody>
<tr>
<td style="border-style: solid; border-width: 1px; border-color: #d3d3d3; padding: 10px; margin: 0px; width: 100%;">
<div>&nbsp;&nbsp;&nbsp; &lt;bean id="securityConstraintMapping" class="org.eclipse.jetty.security.ConstraintMapping"&gt;</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;property name="constraint" ref="securityConstraint" /&gt;</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;property name="pathSpec" value="/admin/send.jsp/" /&gt;</div>
<div>&nbsp;&nbsp;&nbsp; &lt;/bean&gt;</div>

</td>

</tr>

</tbody>

</table>
<div>这表示securityConstraint类对应的角色可以访问/admin/send.jsp 页面。</div>
<div>可以使用/* 代表所有<span style="color: #ff0000;">未单独配置的</span>页面</div>
<div>假设我们需要新建一个只读用户，就可以配置两个角色admin和readonly，这两个角色都需要增加/*的ConstraintMapping 条目，然后在admin上额外配置所有涉及写操作的页面，包括/admin/deleteDestination.action/*，&nbsp;/admin/purgeDestination.action/* 等。</div>
<div>

</div>
<div>最后，在ConstraintSecurityHandler的constraintMappings属性里，把所有的ConstraintMapping都列出来。</div>
<div>

</div>
<table>
<tbody>
<tr>
<td style="border-style: solid; border-width: 1px; border-color: #d3d3d3; padding: 10px; margin: 0px; width: 100%;">
<div>&lt;bean id="securityHandler" class="org.eclipse.jetty.security.ConstraintSecurityHandler"&gt;</div>
<div>&nbsp; &nbsp;&nbsp;&lt;property name="constraintMappings"&gt;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;list&gt;</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;ref bean="securityConstraintMapping" /&gt;</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/list&gt;</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/property&gt;</div>

</td>

</tr>
<tr>
<td style="border-style: solid; border-width: 1px; border-color: #d3d3d3; padding: 10px; margin: 0px; width: 100%;">
&nbsp;</td>

</tr>

</tbody>

</table>
<div>这样，就实现了activemq web console用户的权限配置。</div>

&nbsp;
---
