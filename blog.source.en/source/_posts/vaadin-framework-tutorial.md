---
title: Vaadin Framework Tutorial: A Frontend Development Guide for Java Engineers
description: "Introduction to how the Vaadin framework enables backend engineers to efficiently develop web interfaces without diving deep into the frontend ecosystem, solving the pain points of backend developers writing frontend code."
keywords:
  - Vaadin
  - frontend framework
  - Java
  - web development
  - backend engineer
categories:
  - Java
tags:
  - vaadin
  - java
  - springboot
  - frontend-development
abbrlink: 43947
date: 2024-03-06 19:36:22
---
The pain point of backend engineers developing frontend code is usually that it's too tedious — you often have to spend a long time looking things up for even the smallest task. Vaadin solves this pain point well by providing backend engineers with an easy-to-learn, convenient solution for writing frontend code. Today, let's take a look.

<!-- more -->

Hello everyone, today I'd like to introduce a tool that's especially valuable for backend engineers — Vaadin.

To be honest, getting started with basic HTML and CSS development isn't really difficult. But if you only know these basics, development can be very tedious. If you want to use the various tools in the frontend ecosystem, convenience improves but so does the learning curve. So unless you're a professional full-stack engineer, just a backend developer wanting to write some frontend code temporarily — for example, when building a small project on your own — it's usually a painful process.

Vaadin solves this pain point well. Through Vaadin's pre-packaged common frontend components, we can write functional, reasonably presentable pages with nearly zero learning cost. For programmers with a backend background, this will significantly reduce the cost of building small projects on your own.

What Vaadin offers is the ability to write pages directly in Java code. Vaadin provides various pre-built frontend styles including input fields, forms, and more, and it deeply integrates with Spring Boot, making it very convenient to use.

The underlying principle of Vaadin isn't complex — it's mainly based on server-side rendering, meaning the final HTML code is generated on the backend and sent to the browser. Server-side rendering isn't uncommon, and we won't discuss its advantages and disadvantages compared to client-side rendering here. Of course, for Vaadin, using server-side rendering makes perfect sense — since you're writing backend code, doing rendering on the backend is a completely natural implementation path. Vaadin's engine encapsulates the interaction between frontend and backend, so for users, the interaction between frontend and backend is transparent. At the page level, we can also call backend services normally.

Here's a code example I wrote to give you a more intuitive sense of Vaadin's capabilities:

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

In this code, we used Java code entirely to arrange the various components on the page. Even the button's click handler is defined in a way familiar to Java developers, and it can directly call other backend services — making it nearly zero learning cost.

For detailed code and the running effect, you can check the [project repository](https://github.com/lcy362/mobo-subway).

If you're interested in Vaadin or have any questions or thoughts, feel free to discuss in the comments section. Let's explore how to better leverage Vaadin and improve our development efficiency together!

Source: https://lichuanyang.top/en/posts/43947/

---
