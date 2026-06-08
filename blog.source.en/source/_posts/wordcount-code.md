---
title: WordCount Code
description: "Classic Hadoop WordCount example code with runtime explanation, essential for getting started with big data."
keywords:
  - hadoop
  - wordcount
  - mapreduce
  - introductory example
categories:
  - Big Data
tags:
  - hadoop
  - big-data
abbrlink: 25187
cover: /img/25187.jpg
date: 2012-10-28 18:42:00
---

Reference: [http://www.cnblogs.com/xia520pi/archive/2012/05/16/2504205.html](http://www.cnblogs.com/xia520pi/archive/2012/05/16/2504205.html)

&nbsp;

```java
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

　　public static class **TokenizerMapper**

　　　　　　extends Mapper<Object, Text, Text, IntWritable>{ // Inherits from org.apache.hadoop.mapreduce.Mapper class and overrides its map method

　　　　　　private final static IntWritable one = new IntWritable(1);  // **Mapper<KEYIN,VALUEIN,KEYOUT,VALUEOUT>**

　　　　　　private Text <span style="color: #ff0000;">word</span> = new Text();

　　　　　　public void map(Object key, Text value, Context context)  // Called once for each key/value pair in the input split

　　　　　　　　throws IOException, InterruptedException { // value stores one line of the text file (terminated by newline), while key is the offset of the first character of that line relative to the beginning of the text file

　　　　　　　　StringTokenizer itr = new StringTokenizer(value.toString());    // Split into words

　　　　　　　　while (itr.hasMoreTokens()) {

　　　　　　　　<span style="color: #ff0000;">word</span>.set(itr.nextToken());

　　　　　　　　context.write(word, one);  // Output <word, 1>

　　　　　　　}

　　　　　}

　　　}

　　}

// The system automatically sorts the map results, etc. The reduce input example: (asd,1-1-1)

　　public static class **IntSumReducer**

　　　　　　extends Reducer<Text,IntWritable,Text,IntWritable> { // Reducer<KEYIN,VALUEIN,KEYOUT,VALUEOUT>

　　　　　　private IntWritable result = new IntWritable();

　　　　　　public void reduce(Text key, Iterable<IntWritable> values,Context context)

　　　　　　　　　　 throws IOException, InterruptedException {  // Reducer input is the Map process output; <key,values> where key is a single word, and values are the count values for that word

　　　　　　　　int sum = 0;

　　　　　　　　for (IntWritable val : values) {

　　　　　　　　　　　sum += val.get();

　　　　　　　　}

　　　　　　result.set(sum);

　　　　　　context.write(key, result);

　　　　　}

　　　}

　　}

　　public static void **main**(String[] args) throws Exception {

　　　　Configuration conf = new Configuration();

　　　　String[] otherArgs = new GenericOptionsParser(conf, args).getRemainingArgs();

　　　　if (otherArgs.length != 2) {

　　　　　　System.err.println("Usage: wordcount <in> <out>");

　　　　　　System.exit(2);

　　　　}

　　　　Job job = new Job(conf, "word count");

　　　　job.setJarByClass(WordCount.class);

　　　　job.setMapperClass(TokenizerMapper.class); // setMapperClass: Set the Mapper, defaults to IdentityMapper

　　　　job.setCombinerClass(IntSumReducer.class);

　　　　job.setReducerClass(IntSumReducer.class);// setReducerClass: Set the Reducer, defaults to IdentityReducer

　　　　job.setOutputKeyClass(Text.class);

　　　　job.setOutputValueClass(IntWritable.class);

　　　　FileInputFormat.addInputPath(job, new Path(otherArgs[0]));/ FileInputFormat.addInputPath: Set the input file path; can be a file, a path, or a wildcard. Can be called multiple times to add multiple paths

　　　　FileOutputFormat.setOutputPath(job, new Path(otherArgs[1]));/ FileOutputFormat.setOutputPath: Set the output file path; this path should not exist before the job runs

　　　　System.exit(job.waitForCompletion(true) ? 0 : 1);

}

}

// setInputFormat: Set the map input format, defaults to TextInputFormat, key is LongWritable, value is Text

setNumMapTasks: Set the number of map tasks. This setting usually doesn't take effect; the number of map tasks depends on the number of input splits the input data can be divided into

setMapRunnerClass: Set the MapRunner. Map tasks are run by the MapRunner, which defaults to MapRunnable. Its function is to read records from input splits one by one and sequentially call the Mapper's map function

setMapOutputKeyClass and setMapOutputValueClass: Set the key-value pair format of the Mapper's output

setOutputKeyClass and setOutputValueClass: Set the key-value pair format of the Reducer's output

setPartitionerClass and setNumReduceTasks: Set the Partitioner, which defaults to HashPartitioner. It decides which partition a record enters based on the hash value of the key. Each partition is processed by one reduce task, so the number of partitions equals the number of reduce tasks

setOutputFormat: Set the task's output format, which defaults to TextOutputFormat
```

---

Source: https://lichuanyang.top/en/posts/25187/
