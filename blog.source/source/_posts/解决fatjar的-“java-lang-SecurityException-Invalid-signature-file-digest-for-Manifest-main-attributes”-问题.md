---
title: >-
  解决fatjar的 “java.lang.SecurityException: Invalid signature file digest for
  Manifest main attributes” 问题
tags:
  - java
abbrlink: 2478
date: 2017-04-27 14:16:00
---

最近试图运行一个fatjar的时候报错：
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

查了一下，跟jar包的签名有关。关于签名可以参考： http://www.cnblogs.com/jackofhearts/p/jar_signing.html

有些Jar包会在metainf里包含一个.SF：包含原Jar包内的class文件和资源文件的Hash， 用来校验文件的完整度等验证。

但是在打fat-jar的时候，我们是把很多jar包合成了一个，这样fatjar下就会存在各个jar包中的签名文件，但是他们显然无法跟最终的fatjar作校验。

解决方法就是打包时把签名文件全都去掉，如果是使用maven的话，可以使用shade插件：

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