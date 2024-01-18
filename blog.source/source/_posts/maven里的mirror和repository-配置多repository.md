---
title: 'maven里的mirror和repository: 配置多repository'
tags:
  - maven
abbrlink: 32793
date: 2017-05-19 19:40:00
---

maven里的mirror和repository是两个比较容易混淆的概念，它们的作用都是配置远程maven仓库的地址。顾名思义，repository就是直接配置站点地址，mirror则是作为站点的镜像，代理某个或某几个站点的请求，实现对repository的完全代替。
## repository
有两种形式可以配置多个repository, 配置多个profile或者在同一个profile中配置多个repository.配置多profile时，还需要配置activeProfiles使配置生效。

配置示例：
```
        <profiles>
		</profile>
			<profile>
			<id>central</id>
			<repositories>
				<repository>
					<id>central</id>
					<url>http://search.maven.org/</url>
					<!-- <releases> <enabled>true</enabled> </releases> <snapshots> <enabled>true</enabled> 
						</snapshots> -->
					<releases>
						<enabled>true</enabled>
						<updatePolicy>always</updatePolicy>
					</releases>
					<snapshots>
						<enabled>false</enabled>
						<updatePolicy>always</updatePolicy>
					</snapshots>
				</repository>
			</repositories>
			<pluginRepositories>
				<pluginRepository>
					<id>central</id>
					<url>http://search.maven.org/</url>
					<releases>
						<enabled>false</enabled>
						<updatePolicy>always</updatePolicy>
					</releases>
					<snapshots>
						<enabled>true</enabled>
						<updatePolicy>always</updatePolicy>
					</snapshots>
				</pluginRepository>
			</pluginRepositories>
		</profile>
		<profile>
			<id>aliyun</id>
			<repositories>
				<repository>
					<id>aliyun</id>
					<url>http://maven.aliyun.com/nexus/content/groups/public</url>
					<!-- <releases> <enabled>true</enabled> </releases> <snapshots> <enabled>true</enabled> 
						</snapshots> -->
					<releases>
						<enabled>true</enabled>
						<updatePolicy>always</updatePolicy>
					</releases>
					<snapshots>
						<enabled>true</enabled>
						<updatePolicy>always</updatePolicy>
					</snapshots>
				</repository>
			</repositories>
			<pluginRepositories>
				<pluginRepository>
					<id>aliyun</id>
					<url>http://maven.aliyun.com/nexus/content/groups/public</url>
					<releases>
						<enabled>true</enabled>
						<updatePolicy>always</updatePolicy>
					</releases>
					<snapshots>
						<enabled>true</enabled>
						<updatePolicy>always</updatePolicy>
					</snapshots>
				</pluginRepository>
			</pluginRepositories>
		</profile>
            </profiles>

            <activeProfiles>
		<activeProfile>aliyun</activeProfile>
		<activeProfile>central</activeProfile>
	   </activeProfiles>
```
单profile,多repository的配置也类似。

这样就实现了多站点的配置。下载依赖时，maven会按照配置从上到下的顺序，依次尝试从各个地址下载，成功下载为止。

## mirror
个人感觉mirror的存在有些鸡肋，如果不想用repository里配的地址，完全可以直接改掉，而不用再加一条mirror配置。

如果setting.xml和pom里都配置了repository, 配置的mirror是可以对两个配置文件都生效的，这可能是mirror存在的唯一意义。

mirror的配置示例：

```xml
	<mirror>
			<id>nexus-aliyun</id>
			<mirrorOf>*</mirrorOf>
			<name>Nexus aliyun</name>
			<url>http://maven.aliyun.com/nexus/content/groups/public</url>
        </mirror>
```
使用mirrorOf指定这个镜像是针对哪个repository的，配置成*就表示要代理所有repository的请求。

需要注意的是，与repository不同，配置到同一个repository的多个mirror时，相互之间是备份的关系，只有在仓库连不上的时候才会切换另一个，而如果在能连上的情况下找不到包，是不会尝试下一个地址的。

所以，一般情况下，无论是配置国内的maven仓库，还是配置nexus之类私服，都可以直接配置成repository， 这样即使配置的这些仓库有些问题导致一些包下不下来，也可以继续用别的仓库尝试。