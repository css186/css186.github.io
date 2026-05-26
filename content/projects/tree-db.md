+++
authors = ["Brian"]
title = "Tree-Based Seminar Database"
date = "2024-10-19"
description = "A Tree-based (BSTs and a 2D spatial tree) database implemented from scratch"
tags = [
    "Java",
    "Data Structures",
    "Algorithms",
    "Binary Search Tree",
    "Spatial Tree",
]
categories = [
    "Programming",
    "Data Structures and Algorithms",
]
series = ["Theme Demo"]
aliases = ["migrate-from-jekyl"]
draft = "false"
+++

Link: https://github.com/css186/Tree-Based-Seminar-Database

### Project Description

This project is a seminar database that supports multi-criteria storage, retrieval, and spatial queries. It organizes seminars' information using binary search trees (BSTs) for attribute-based indexing and a spatial tree called "Bintree" for location-based queries..

**All data structures in this project were built from scratch. The only built-in container allowed is the static array**

Here is a breakdown of its components and functionality:

### Core Functionality

1. Data Management:

   - BSTs index seminars by: (each index will have its own BST)
     - ID (unique identifier)
     - Cost (numeric range searching)
     - Date (string range searching)
     - Keywords (string exact-match searching)
   - Duplicate records are allowed and will be stored on the left subtrees based on requirement.
   - Bintree: The Bintree partitions 2D space to efficiently store and query seminars by their coordinates (x, y).

2. Operations:

   - Insert: Adds seminars to all relevant trees after validating coordinates are valid.
   - Delete: Removes seminars by ID from all trees.
   - Search:
     - Exact matches (ID and keywords).
     - Range queries (Cost and Date).
     - Spatial radius queries (find seminars near a designated coordinate).
   - Print: Visualizes tree structure in the console.

### Key Components

1. Binary Search Trees (`BiarySearchTree.java`)

   - Implemented using Generics.
   - Handle duplicates (stored in left subtree).
   - Support range searches.
   - Track traversal counts.

2. Bintree (`Bintree.java`)

   - Internal Nodes: Split space into quadrants (horizontal/vertical splits based on current dimensions).
   - Leaf Nodes: Store seminars and the same location. Split into internal nodes when capacity is exceeded.
   - Spatial Queries: Find seminars within a radius of a given (x, y) coordinates.

3. Seminar Class (`Seminar.java`)

   - Stores metadata: ID, title, date, duration, cost, keywords, description, and coordinates (x, y).

4. Command Processing(`CommandProcessor.java`)

   - Parses input files with commands like:

   ```
   insert <ID> <title> <date> <x> <y> <cost> <keywords> <description>
   print <ID|date|keyword|cost|location>
   search <ID|keyword|cost|date|location> [parameters]
   delete <ID>
   ```

5. Testing
   - Extensive test coverage and mutation tests were implemented.

### Program Invocation

The program will be invoked from the command line as:
`java SemSearch {worldSize} {commandFile}`

- Parameter {worldSize} is an integer that is a power of two, and it speciaies the size of the world for the seminar location aield. The world is assumed to have x and y coordinates from 0 to {worldSize - 1}.
- Correct and complete format of input files can be referenced within the `solutionTestData` directory.

### Sample Output

![image](/images/projects/tree_db.png)

### Takeaways

1. Binary Search Tree is not the best option to be the backbone of a database. However, it is a very basic and important data structure due to its efficiency.
2. This was my first time trying to implement a spatial tree from scratch, so it was quite a challenge to me. The difficulty lies in understanding how nodes will split in different dimensions. Also, the abstraction of creating container is always considered not so easy. I absolutely learnt a lot through this project.
