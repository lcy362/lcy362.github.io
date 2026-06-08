---
title: >-
  Fixing the SecurityException: Invalid Signature File Digest for Manifest Main
  Attributes in Fat Jars
description: "Solving the SecurityException caused by signature verification when creating fat jars, understanding the META-INF signature mechanism, and methods to exclude signature files."
tags:
  - java
abbrlink: 2478
cover: /img/2478.png
date: 2017-04-27 14:16:00
keywords:
  - fat
  - jar
  - securityexception
  - signature
  - meta-inf
categories:
  - Java
---
Recently I encountered an error when trying to run a fat jar:
```
Exception in thread "main" java.lang.SecurityException: Invalid signature file digest for Manifest main attributes
	at sun.security.util.SignatureFileVerifier.processImpl(SignatureFileVerifier.java:287)
	at sun.security.util.SignatureFileVerifier.process(SignatureFileVerifier.java:240)
	at java.util.jar.JarVerifier.processEntry(JarVerifier.java:317)
	at java.util.jar.JarVerifier.update(JarVerifier.java:228)
	at java.util.jar.JarFile.initializeVerifier(JarFile.java:348)
	at java.util.jar.JarFile.getInputStream(JarFile.java:415)
	at sun.misc.URLClassPath$JarLoader$2.getInputStream(URLClassPath.java:775)
	at sun.misc.Resource.cachedInputStream(Resource.java:77)
	at sun.misc.Resource.getByteBuffer(Resource.java:160)
	at java.net.URLClassLoader.defineClass(URLClassLoader.java:436)
	at java.net.URLClassLoader.access$100(URLClassLoader.java:71)
	at java.net.URLClassLoader$1.run(URLClassLoader.java:361)
	at java.net.URLClassLoader$1.run(URLClassLoader.java:355)
	at java.security.AccessController.doPrivileged(Native Method)
	at java.net.URLClassLoader.findClass(URLClassLoader.java:354)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:425)
	at sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:308)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:358)
	at sun.launcher.LauncherHelper.checkAndLoadMain(LauncherHelper.java:482)
```

After some investigation, I found it's related to jar signing. For details on signing, you can refer to: http://www.cnblogs.com/jackofhearts/p/jar_signing.html

Some jar packages contain a `.SF` file in `META-INF`, which includes the hashes of the class files and resource files in the original jar package, used for verifying file integrity and other validations.

However, when building a fat jar, we combine many jar packages into one. This means the fat jar ends up containing signature files from each individual jar, but they obviously cannot be validated against the final fat jar.

The solution is to remove all signature files during packaging. If you're using Maven, you can use the shade plugin:

```
           <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>1.7.1</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                        <configuration>
                            <filters>
                                <filter>
                                    <artifact>*:*</artifact>
                                    <excludes>
                                        <exclude>META-INF/*.SF</exclude>
                                        <exclude>META-INF/*.DSA</exclude>
                                        <exclude>META-INF/*.RSA</exclude>
                                    </excludes>
                                </filter>
                            </filters>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
```
Source: https://lichuanyang.top/en/posts/2478/

---
