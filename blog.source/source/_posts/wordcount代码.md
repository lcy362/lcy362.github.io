---
title: wordcount代码
description: "Hadoop WordCount 经典示例代码及运行过程说明，大数据入门必读。"
tags:
  - hadoop
  - 大数据
abbrlink: 25187
date: 2012-10-28 18:42:00
---

参考[http://www.cnblogs.com/xia520pi/archive/2012/05/16/2504205.html](http://www.cnblogs.com/xia520pi/archive/2012/05/16/2504205.html)

&nbsp;

package org.apache.hadoop.examples;

import java.io.IOException;

import java.util.StringTokenizer;

import org.apache.hadoop.conf.Configuration;

import org.apache.hadoop.fs.Path;

import org.apache.hadoop.io.IntWritable;

import org.apache.hadoop.io.Text;

import org.apache.hadoop.mapreduce.Job;

import org.apache.hadoop.mapreduce.Mapper;

import org.apache.hadoop.mapreduce.Reducer;

import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;

import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

import org.apache.hadoop.util.GenericOptionsParser;

public class WordCount {

　　public static class&nbsp;**TokenizerMapper**

　　　　　　extends Mapper&lt;Object, Text, Text, IntWritable&gt;{ &nbsp;/<span style="color: #3366ff;">/继承org.apache.hadoop.mapreduce包中**Mapper**类，并**重写**其map方法</span>

　　　　　　private final static IntWritable one = new IntWritable(1); &nbsp; //<span style="color: #3366ff;">**Mapper&lt;KEYIN,VALUEIN,KEYOUT,VALUEOUT&gt;**</span>

　　　　　　private Text <span style="color: #ff0000;">word</span> = new Text();

&nbsp;

　　　　　　public void map(Object key, Text value, Context context) &nbsp;//<span>Called once for each key/value pair in the input split</span>

　　　　　　　　throws IOException, InterruptedException { &nbsp;//<span style="color: #3366ff;">value值存储的是文本文件中的一行（以回车符为行结束标记），而key值为该行的首字母相对于文本文件的首地址的偏移量</span>

　　　　　　　　StringTokenizer itr = new StringTokenizer(value.toString()); &nbsp; &nbsp;//<span style="color: #3366ff;">拆分成单词</span>

　　　　　　　　while (itr.hasMoreTokens()) {

　　　　　　　　<span style="color: #ff0000;">word</span>.set(itr.nextToken());

　　　　　　　　context.write(word, one); &nbsp;/<span style="color: #3366ff;">/输出&lt;word，1&gt;</span>

　　　　　　}

　　　　}

　　}

//系统自动对map结果进行排序等处理，reduce输入例 （asd,1-1-1)

　　public static class&nbsp;**IntSumReducer**

　　　　　　extends Reducer&lt;Text,IntWritable,Text,IntWritable&gt; { &nbsp;//<span style="color: #3366ff;">Reducer&lt;KEYIN,VALUEIN,KEYOUT,VALUEOUT&gt;</span>

　　　　　　private IntWritable result = new IntWritable();

　　　　　　public void reduce(Text key, Iterable&lt;IntWritable&gt; values,Context context)

　　　　　　　　　　 throws IOException, InterruptedException { &nbsp; /<span style="color: #3366ff;">/reducer输入为Map过程输出，&lt;key,values&gt;中key为单个单词，而values是对应单词的计数值</span>

　　　　　　　　int sum = 0;

　　　　　　　　for (IntWritable val : values) {

　　　　　　　　　　　sum += val.get();

　　　　　　　　}

　　　　　　result.set(sum);

　　　　　　context.write(key, result);

　　　　}

　　}

&nbsp;

　　public static void&nbsp;**main**(String[] args) throws Exception {

　　　　Configuration conf = new Configuration();

　　　　String[] otherArgs = new GenericOptionsParser(conf, args).getRemainingArgs();

　　　　if (otherArgs.length != 2) {

　　　　　　System.err.println("Usage: wordcount &lt;in&gt; &lt;out&gt;");

　　　　　　System.exit(2);

　　　　}

　　　　Job job = new Job(conf, "word count");

　　　　job.setJarByClass(WordCount.class);

　　　　job.setMapperClass(TokenizerMapper.class); //<span style="color: #3366ff;">setMapperClass：设置Mapper，默认为IdentityMapper</span>

　　　　job.setCombinerClass(IntSumReducer.class);

　　　　job.setReducerClass(IntSumReducer.class);//<span style="color: #3366ff;">setReducerClass：设置Reducer，默认为IdentityReducer</span>

　　　　job.setOutputKeyClass(Text.class);

　　　　job.setOutputValueClass(IntWritable.class);

　　　　FileInputFormat.addInputPath(job, new Path(otherArgs[0]));/<span style="color: #3366ff;">/FileInputFormat.addInputPath：设置输入文件的路径，可以是一个文件，一个路径，一个通配符。可以被调用多次添加多个路径</span>

　　　　FileOutputFormat.setOutputPath(job, new Path(otherArgs[1]));/<span style="color: #3366ff;">/FileOutputFormat.setOutputPath：设置输出文件的路径，在job运行前此路径不应该存在</span>

　　　　System.exit(job.waitForCompletion(true) ? 0 : 1);

}

}

//setInputFormat：设置map的输入格式，默认为TextInputFormat，key为LongWritable, value为Text

setNumMapTasks：设置map任务的个数，此设置通常不起作用，map任务的个数取决于输入的数据所能分成的input split的个数

&nbsp;

setMapRunnerClass：设置MapRunner, map task是由MapRunner运行的，默认为MapRunnable，其功能为读取input split的一个个record，依次调用Mapper的map函数

setMapOutputKeyClass和setMapOutputValueClass：设置Mapper的输出的key-value对的格式

setOutputKeyClass和setOutputValueClass：设置Reducer的输出的key-value对的格式

setPartitionerClass和setNumReduceTasks：设置Partitioner，默认为HashPartitioner，其根据key的hash值来决定进入哪个partition，每个partition被一个reduce task处理，所以partition的个数等于reduce task的个数

&nbsp;

setOutputFormat：设置任务的输出格式，默认为TextOutputFormat

&nbsp;