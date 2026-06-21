---
title: 'Maven Mirror and Repository: Configuring Multiple Repositories'
description: "Clarify the differences between mirror and repository in Maven, and introduce the correct way to configure multiple repositories and mirror proxies."
keywords:
  - Maven
  - mirror
  - repository
  - repository configuration
  - dependency management
categories:
  - Java
tags:
  - maven
abbrlink: 32793
cover: /img/32793.jpg
date: 2017-05-19 19:40:00
---
Mirror and repository in Maven are two easily confused concepts, as both are used to configure the addresses of remote Maven repositories. As the name suggests, a repository directly configures the site address, while a mirror acts as a site's mirror, proxying requests to one or several sites, achieving a complete replacement of repositories.

## Repository

There are two ways to configure multiple repositories: configuring multiple profiles or configuring multiple repositories within a single profile. When configuring multiple profiles, you also need to configure activeProfiles for the configurations to take effect.

Configuration example:
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

Single profile, multiple repository configuration is also similar.

This way, multiple site configurations are achieved. When downloading dependencies, Maven will try to download from each address in the order configured from top to bottom, until a successful download is made.

## Mirror

In my opinion, the existence of mirror is somewhat redundant. If you don't want to use the address configured in the repository, you can simply change it directly, without adding another mirror configuration.

If both settings.xml and pom have configured repositories, the configured mirror can take effect on both configuration files, which may be the only meaning of mirror's existence.

Mirror configuration example:

```xml
	<mirror>
			<id>nexus-aliyun</id>
			<mirrorOf>*</mirrorOf>
			<name>Nexus aliyun</name>
			<url>http://maven.aliyun.com/nexus/content/groups/public</url>
        </mirror>
```

Use mirrorOf to specify which repository this mirror targets. Setting it to * means it will proxy requests to all repositories.

Note that, unlike repositories, when multiple mirrors are configured for the same repository, they are in a backup relationship with each other. They will only switch to another one when the repository is unreachable. If the repository is reachable but a package cannot be found, it will not try the next address.

Therefore, in general, whether configuring domestic Maven repositories or configuring private repositories like Nexus, you can directly configure them as repositories. This way, even if some of these configured repositories have issues and some packages cannot be downloaded, you can still try other repositories.
---
Source: https://lichuanyang.top/en/posts/32793/
