---
title: Vaadin框架教程：Java工程师的前端开发秘籍
description: "介绍 Vaadin 框架如何让后端工程师无需深入前端生态就能高效开发 Web 界面，解决后端开发前端的痛点。"
tags:
  - vaadin
  - java
  - springboot
  - 前端开发
abbrlink: 43947
date: 2024-03-06 19:36:22
---

后端工程师开发前端的痛点，通常来说莫过于太过繁琐，经常要为了一些很小的事查半天。Vaadin很好的解决了这个痛点，为后端工程师提供易上手、方便使用的前端代码编写解决方案，今天我们就来了解一下。

<!-- more -->


大家好，今天跟大家介绍一个对后端工程师特别有价值的工具——Vaadin。

说起来，上手前端基本的html, css开发，确实并不难，但是如果只会这些基本的东西，开发起来会很繁琐。如果想要使用前端生态中的各种轮子，虽说便利度提升了，但学习成本也会同步上升。所以，如果不是职业的全栈工程师，只是作为一个后端，想临时写点前端代码，比如自己想做点小项目，通常来说都会有个很痛苦的过程。


Vaadin很好的解决了这个痛点。通过vaadin包装好的常用前端组件，我们几乎可以零学习成本的编写出功能完备、不太难看的页面。对于后端背景的程序员来说，无疑会大幅度降低自己做些小项目的成本。


Vaadin提供的功能，就是可以直接用java代码来写页面。Vaadin提供了多种输入框、表单等等封装好的前端样式，而且与springboot做了深度的融合，使用起来非常方便。


Vaadin的实际原理并不复杂，主要是基于服务端渲染，即在后端生成最终的html代码，交给浏览器。服务端渲染，这个并不罕见，与客户端渲染的优势和劣势，我们在这里不多讲。当然，对于vaadin来说，使用服务端渲染，似乎也没什么好说的，毕竟是写的后端代码，直接在后端做渲染，是个再正常不过的实现路径。Vaadin的引擎对前后端之间的交互做了封装，所以对使用者来说，前后端之间的交互是无感的，在页面层，我们也可以正常的调用后端service.

下面是我写的一段代码示例，可以更直观的感受Vaadin的作用：

```
@Route(value = "path", layout = MainView.class)
@PageTitle("路径规划")
public class PathView extends VerticalLayout {

    @Autowired
    private PathService pathService;

    public PathView() {
        TextField start = new TextField();
        TextField end = new TextField();
        HorizontalLayout path = new HorizontalLayout();
        path.add(start, end);
        Button pathCalculate = new Button("calculate path");

        VerticalLayout result = new VerticalLayout();
        TextField transferNum = new TextField();
        TextField distance = new TextField();
        Text stations = new Text("");
        result.add(
                new H3("换乘数: "),
                transferNum,
                new H3("总距离 :"),
                distance,
                new H3("途径站点详情:"),
                stations
        );

        pathCalculate.addClickListener(click -> {
            PathInfoVO pathResult = pathService.getPath(start.getValue(), end.getValue());
            System.out.println(pathResult);
            stations.setText(StringUtils.join(pathResult.getDetail(), ","));
            transferNum.setValue(String.valueOf(pathResult.getTransferNum()));
            distance.setValue(String.valueOf(pathResult.getDistance()));
        });

        add(
                new Text("hello world"),
                path,
                pathCalculate,
                result
        );
    }
}
```
这段代码中，我们完全使用java代码对页面中的各个组件进行了编排，包括button的click函数，也是使用java开发者习惯的方式定义，并且能够直接调用其他后端service, 可以说是几乎零学习成本了。

详细代码和运行效果，可以到 [项目地址](https://github.com/lcy362/mobo-subway)中查看。


如果你对Vaadin感兴趣，或者有任何问题或想法，欢迎在评论区交流。一起探索如何更好地利用Vaadin，提升我们的开发效率吧！

原文地址： https://lichuanyang.top/posts/43947/
