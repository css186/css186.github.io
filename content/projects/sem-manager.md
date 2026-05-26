+++
authors = ["Brian"]
title = "Memory Manager"
date = "2024-12-06"
description = "A simulation program for storing, managing records and handling memory allocation and data retrieval using a combination of a hash table and a memory manager"
tags = [
    "Java",
    "Data Structures",
    "Algorithms",
    "Hash Table",
    "Memory Management",
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

This project is a simulation program for storing, managing records and handling memory allocation and data retrieval using a combination of a hash table and a memory manager.

Here is a breakdown of its components and functionality:

### Core Functionality

1. Hash Table (`HashTable.java`)
    - Uses **quadratic probing** for collision resolution.
    - Stores Record objects that pair seminar IDs with **memory handles**.
    - Automatically resizes when the load factor exceeds a threshold.

2. Memory Manager(`MemManager.java`)
    - Manages a dynamic byte array (memory pool) to store serialized seminar data.
    - Uses a free block list (doubly linked list) to track available memory blocks.
    - **Allocates memory for new records, splits free blocks if necessary, and merges adjacent blocks when freeing memory.**
    - Expands the memory pool incrementally when space runs out.

3. Seminar Object (`Seminar.java`)
    - Represents seminar data (ID, title, date, location, cost, keywords, etc.).
    - Supports serialization/deserialization to convert objects to/from byte streams for storage in the memory pool.

4. Controller (`Controller.java`)
    - Coordinates interactions between the hash table and memory manager.
    - Implements operations: insert, search, delete, print (hash table or free blocks).

5. Command Processor (`CommandProcessor.java`)
    - Parses input files containing commands (insert, search, delete, print).
    - Executes commands by invoking the controller.

### Key Workflows

1. Insert
    - Serializes the seminar into a byte array.
    - Allocates memory via MemManager and stores the data.
    - Updates the hash table with the ID and memory handle.

2. Search
    - Retrieves the handle from the hash table using the ID.
    - Fetches the byte array from memory and deserializes it into a Seminar object.

3. Delete
    - Removes the ID from the hash table.
    - Marks the associated memory block as free (merged with adjacent blocks if possible).

4. Memory Management
    - Uses a **best-fit** strategy to allocate memory from the free block list.
    - **Merges adjacent free blocks during insert and remove operations to reduce fragmentation.**

### Program Invocation

The program will be invoked from the command line as:
`java SemMananager {initial-memory-size} {initial-hash-size} {command-file}`

- Correct and complete format of input files can be referenced with text files having the `_input.txt` postfix

### Sample Output

![image](/images/projects/mem.png)

### Takeaways

- This program efficiently manages seminar records in memory, ensuring fast lookups (via hashing) and optimized memory usage (via dynamic block allocation/merging).
- Still, code up memory management related functionality is quite challenging and I am very glad that I gave it a try.
