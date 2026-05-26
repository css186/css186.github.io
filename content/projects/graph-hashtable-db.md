+++
authors = ["Brian"]
title = "Graph and Hash Table Based Song/Artist Database"
date = "2024-09-19"
description = "A graph and hash table based database implemented from scratch"
tags = [
    "Java",
    "Data Structures",
    "Algorithms",
    "Hash Table",
    "Graph",
]
categories = [
    "Programming",
    "Data Structures and Algorithms",
]
series = ["Theme Demo"]
aliases = ["migrate-from-jekyl"]
draft = "false"
+++

Link: https://github.com/css186/Graph-and-Hash-Table-Based-Song-Artist-Database

### Project Description

This project is a simulated database for storing songs, artists information, and tracking relationships between them. The records stored inside are artist names and track names. The two main data structures used are a hash table and a graph.

**All data structures in this project were built from scratch. The only built-in container allowed is the static array**

Here is a breakdown of its components and functionality:

### Core Functionality

1. Data Management:

   - Artists and songs are stored seperately into two hash tables, and there is a graph structure whose responsibility is to manage relationships between artists and songs.
   - The relationships are modeled as edges in a graph. If multiple songs were written by one common artist, they should be considered as a connected component.
   - Duplicate entries are not allowed.

2. Operations:

   - Insert: User can add artist/song entries, and the database will store and connect them together automatically.
   - Remove: User can delete entries, and the relationships will be adjusted accordingly.
   - Print: Entries stored inside or graph statistics(connected components) can be visible in console.

3. Graph Analysis:
   - Union-Find and BFS algorithms were both implemented to track connected components.
   - Reports:
     - Total connected components.
     - Largest connected component size.

### Key Components

1. Hash Tables (`Hash.java`)

   - Quadratic probing for collision resolution.
   - Dynamic resizing (doubles capacity when load factor exceeds 50%).
   - Tombstone markers were used for deleted entries to ensure searching works correctly.

2. Graph (`Graph.java`)

   - Graph was implemented using adjacency lists and backboned by a doubly linked list (`DoublyLinkedList.java`).

3. Controller (`Controller.java`)

   - Coordinates hash tables and graph operations.
   - Handles command execution (i.e. insert/remove.print).

4. Command Processing(`CommandProcessor.java`)

   - Parses input files with commands like:

   ```
   insert <artist><SEP><song>
   remove artist <name>
   print graph
   ```

5. Testing
   - Extensive test coverage and mutation tests were implemented.

### Program Invocation

The program will be invoked from the command line as:
`java GraphProject {initHashSize} {pathOfInputFile}`

- The name of the program is GraphProject. Parameter {initHashSize} is the initial size for each of the two hash tables (in terms of slots).
- Correct and complete format of input files can be referenced within the `solutionTestData` directory.

### Sample Output

![image](/images/projects/ht_db.png)

### Takeaways

1. Using tombstone to mark deleted item is a really clever move.
2. BFS algorithms is an additional feature as the requirement only covers Union-Find. Since there is a doubly linked list can be used, why not repeat myself in order to have a better grasp on one of the most important algorithms.
