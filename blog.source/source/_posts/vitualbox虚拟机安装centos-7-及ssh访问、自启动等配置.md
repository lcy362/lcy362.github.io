---
title: vitualbox虚拟机安装centos 7 及ssh访问、自启动等配置
tags:
  - 开发环境
abbrlink: 62625
date: 2017-04-02 12:45:00
---

为了方便，最近用vitualbox搭了一个centos7的虚拟机，整个过程比较简单，在这里记录一下。
## 下载vitualbox
直接去官网（https://www.virtualbox.org/wiki/Downloads）下载即可

## 下载centos安装包
同样官网下载（https://www.centos.org/download/），我下载的是minimal iso

## 安装
安装过程很简单，一路默认点下去就可以，中间内存、分区什么的可以根据需要调一下

## 配置本机ssh访问
vitualbox默认的分辨率非常低，可以通过安装增强工具进行优化。不过由于我们不需要图形化界面，其实可以通过其他方式解决这一问题，就是用xshell或者putty通过ssh远程登陆到虚拟机上。
### 打开ssh服务
```
service sshd start
chkconfig sshd on
```
分别启动ssh服务，并将ssh设定为自启动

### 关闭防火墙
由于只是弄着玩的，直接把防火墙关掉，方便。

centos7的防火墙操作和之前版本区别很大：
```
sudo systemctl stop firewalld.service
sudo systemctl disable firewalld.service
```
关闭防火墙和自动启动

### 配置端口转发
在VitualBox下配置端口转发：设置-网络-高级-端口转发，将22端口转发到主机的端口上，可以同样是22，也可以配置成其他端口.

如果需要在主机上访问虚拟机的其他端口，例如tomcat的8080，activemq的61616，8161,也可以在这儿一并配了。

### 查看虚拟机ip
在主机上执行ipconfig,找sudo systemctl disable firewalld.service对应的ip, 然后就可以在xshell中配置对应的ip和端口，访问虚拟机了。

## 配置自启动服务
centos下配置自启动的方式很多，我们在这里提供一种最简单的方式。

### 写一个脚本
例如vim /opt/app/service.sh
```
#!/bin/bash
export JAVA_HOME=/opt/app/jdk1.8.0_121
sh /opt/app/apache-activemq-5.14.4/bin/activemq start >/opt/app/start.log
```
把需要自启动的脚本全都放这儿，以后想增加自启动服务的时候，也只需要操作这个脚本。

### 配置
chmod +x /opt/app/service.sh

centos7下/etc/rc.d/rc.local也需要自己去加执行权限：

chmod +x /etc/rc.d/rc.local

然后打开/etc/rc.d/rc.local，在最后把自己写的脚本加上：

/opt/app/service.sh

保存，就完成自启动服务的配置了。

之后，我们可以通过vitualbox的无界面方式启动，然后在xshell中自由操作。