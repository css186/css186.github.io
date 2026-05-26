+++
authors = ["Brian"]
title = "External Sorting"
date = "2024-11-08"
description = "External Sorting with Replacement Selection and Multiway Merge"
tags = [
    "Java",
    "Data Structures",
    "Algorithms",
    "External Sorting",
    "Heap",
]
categories = [
    "Programming",
    "Data Structures and Algorithms",
]
series = ["Theme Demo"]
aliases = ["migrate-from-jekyl"]
draft = false
+++

Link: https://github.com/css186/External-Sorting

### Project Description

This program implements an **external sorting algorithm** designed to handle large datasets that exceed memory capacity. It uses **replacement selection** to create sorted runs and **multiway merging** to combine them into a single sorted output.

Here is a breakdown of its components and functionality:

### Core Functionality

1. External Sorting

   - Replacement Selection (`ReplacementSelection.java`)

     - Divides input into sorted "runs" using a **min-heap** to manage records in memory.
     - Deferred records (those smaller than the last output) are stored in a linked list for the next run.

   - Multiway Merge:
     - Merges sorted runs from disk using a **min-heap** and a **doubly linked list** to efficiently combine runs into a final sorted file.

2. Memory Management:

   - Buffered I/O: Uses ByteFileProcessor (`ByteFileProcessor.java`) with block-sized buffers (8KB) to minimize disk access.

   - Heap-Based Sorting: Maintains a fixed-size heap (8 blocks \* 512 records/block = 4096 records) to sort data in memory. (`MinHeap.java`)

### Key Components

1. ReplacementSelection Class:

   - sort(): Generates sorted runs via replacement selection.
   - merge(): Merges runs using a min-heap of RunRecord objects.
   - writeDataToFile(): Writes merged data back to the input file.

2. Data Structures:

   - MinHeap: Prioritizes records during sorting/merging.
   - Doubly Linked List: Manages deferred records during replacement selection.
   - RunRecord: Tracks run metadata (start position, length) for merging.

3. File Handling:

   - ByteFileProcessor: Reads/writes records in blocks (16-byte records, 512 records/block).
   - Record Class: Stores 16-byte data (8-byte long ID, 8-byte double key).

4. Testing
   - Extensive test coverage and mutation tests were implemented.

### Program Invocation

The program will be invoked from the command line as:
`java Externalsort <filename>`

- <filename> is the name of the file with the records to be sorted. Please be noted that this program does modify the input data file.

### Takeaways

- To me, this is probably one of the most counter-intuitive algorithms that I have implmemented. As for the reason, I guess that I am used to deal with implementing codes that runs purely on RAM. Once disk I/O and buffers are involved, things often get complicated and not so straight-forward.
