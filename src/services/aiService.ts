import type { AIAssistResult } from "../types"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomDelay() {
  return delay(800 + Math.random() * 1200)
}

function extractKeywords(content: string): string[] {
  const words = content.toLowerCase().split(/\s+/)
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "above", "below",
    "between", "out", "off", "over", "under", "again", "further", "then",
    "once", "here", "there", "when", "where", "why", "how", "all", "each",
    "every", "both", "few", "more", "most", "other", "some", "such", "no",
    "nor", "not", "only", "own", "same", "so", "than", "too", "very", "just",
    "because", "but", "and", "or", "if", "while", "that", "this", "these",
    "those", "it", "its", "also",
  ])
  return [...new Set(words.filter((w) => w.length > 3 && !stopWords.has(w)))]
}

const topicResponses: Record<string, string[]> = {
  deadlock: [
    "Deadlock Prevention using Mutex Lock Ordering",
    "Deadlock Avoidance with Banker's Algorithm",
    "Deadlock Detection and Recovery Techniques",
    "Resource Allocation Graphs and Cycle Detection",
    "Conditions for Deadlock: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait",
  ],
  scheduling: [
    "FCFS (First Come First Served) Scheduling",
    "SJF (Shortest Job First) and SRTF Scheduling",
    "Round Robin Scheduling with Time Quantum",
    "Priority Scheduling and Aging",
    "Multilevel Queue and Multilevel Feedback Queue Scheduling",
  ],
  memory: [
    "Paging and Page Tables Architecture",
    "Segmentation and Combined Paging with Segmentation",
    "Virtual Memory and Demand Paging",
    "Page Replacement Algorithms: FIFO, LRU, Optimal",
    "Thrashing and Working Set Model",
  ],
  process: [
    "Process States and State Transitions",
    "Process Control Block (PCB) Structure",
    "Context Switching and Overhead",
    "Process Creation using fork() and exec()",
    "Interprocess Communication: Pipes, Message Queues, Shared Memory",
  ],
  file: [
    "File System Architecture and Mounting",
    "File Allocation Methods: Contiguous, Linked, Indexed",
    "Directory Structures: Single-Level, Two-Level, Tree",
    "Free Space Management: Bitmap, Free List",
    "Disk Scheduling: FCFS, SCAN, C-SCAN, LOOK",
  ],
  thread: [
    "User-Level vs Kernel-Level Threads",
    "Multithreading Models: Many-to-One, One-to-One, Many-to-Many",
    "Thread Pools and Benefits",
    "Thread Synchronization with Mutex and Semaphores",
    "POSIX Threads (pthreads) Library",
  ],
  synchronization: [
    "Critical Section Problem and Peterson's Solution",
    "Semaphores and Mutex Locks",
    "Classic Problems: Bounded Buffer, Readers-Writers, Dining Philosophers",
    "Monitors and Condition Variables",
    "Hardware-Based Synchronization: Test-and-Set, Compare-and-Swap",
  ],
  java: [
    "Object-Oriented Programming: Encapsulation, Inheritance, Polymorphism",
    "Exception Handling with try-catch-finally",
    "Collections Framework: List, Set, Map implementations",
    "Multithreading in Java with Runnable and Thread",
    "Java Streams API and Lambda Expressions",
  ],
  network: [
    "OSI Model vs TCP/IP Protocol Suite",
    "IPv4 Addressing and Subnetting",
    "Routing Protocols: RIP, OSPF, BGP",
    "TCP vs UDP: Connection-Oriented vs Connectionless",
    "Network Security: Firewalls, Encryption, Digital Signatures",
  ],
  database: [
    "Normalization: 1NF, 2NF, 3NF, BCNF",
    "SQL Joins: Inner, Outer, Cross, Self Joins",
    "Transaction Management and ACID Properties",
    "Indexing: B-Tree and Hash Indexes",
    "Concurrency Control: Lock-Based and Timestamp-Based Protocols",
  ],
}

function getTopicData(content: string): { keywords: string[]; matchedTopic: string | null } {
  const keywords = extractKeywords(content)
  const lowerContent = content.toLowerCase()
  const matchedTopic = Object.keys(topicResponses).find((topic) => lowerContent.includes(topic)) ?? null
  return { keywords, matchedTopic }
}

export type MCQ = { question: string; options: string[]; answer: number }

export async function generateSummary(content: string): Promise<string> {
  await randomDelay()
  const { matchedTopic, keywords } = getTopicData(content)
  if (!matchedTopic) {
    return `This document covers various concepts related to ${keywords.slice(0, 3).join(", ")}. The content provides foundational knowledge that builds upon previously learned topics. Key areas include understanding core principles, practical applications, and theoretical frameworks. Further study and revision of these concepts will strengthen comprehension and exam readiness.`
  }
  const summaries: Record<string, string> = {
    deadlock:
      "Deadlock is a critical state in operating systems where two or more processes are unable to proceed because each is waiting for a resource held by another. The four necessary conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Prevention strategies ensure at least one condition cannot hold. Avoidance uses the Banker's Algorithm to check safe states. Detection identifies deadlocks using Resource Allocation Graphs, and Recovery can be done through process termination or resource preemption.",
    scheduling:
      "CPU Scheduling is the mechanism by which the operating system selects which process to execute next. FCFS is simple but suffers from the convoy effect. SJF is optimal for minimizing average waiting time but requires advance knowledge of burst times. Round Robin provides fairness through time quantum, while Priority Scheduling can lead to starvation. Modern systems use Multilevel Feedback Queue scheduling to balance responsiveness and throughput.",
    memory:
      "Memory management involves allocating and deallocating memory to processes. Paging eliminates external fragmentation by dividing memory into fixed-size frames and pages. Virtual memory allows processes to execute without being fully loaded into memory using demand paging. Page replacement algorithms like FIFO, LRU, and Optimal handle page faults. The Working Set Model prevents thrashing by maintaining the set of pages actively used by a process.",
    process:
      "A process is an instance of a program in execution, managed by the OS through Process Control Blocks. Processes transition between New, Ready, Running, Waiting, and Terminated states. Context switching allows multitasking but incurs overhead. IPC mechanisms like pipes, message queues, and shared memory enable communication between processes. The fork() system call creates child processes with a separate address space.",
    thread:
      "Threads are lightweight units of execution within a process, sharing the same address space. User-level threads are managed without kernel support, offering fast context switches, while kernel-level threads are managed by the OS with system call overhead. Multithreading models determine how user threads map to kernel threads. Thread pools improve performance by reusing existing threads rather than creating new ones for each task.",
    synchronization:
      "Process synchronization ensures orderly access to shared resources. The Critical Section Problem requires mutual exclusion, progress, and bounded waiting. Peterson's Solution provides a software-based approach for two processes. Semaphores are integer variables that control access to resources through wait() and signal() operations. Classic synchronization problems help understand concurrency challenges and their solutions.",
    java:
      "Java is an object-oriented programming language emphasizing platform independence through the JVM. OOP principles include encapsulation, inheritance, and polymorphism. Exception handling separates error-handling code from regular code. The Collections Framework provides reusable data structures, and multithreading enables concurrent execution. Modern Java features include streams, lambdas, and the module system.",
    network:
      "Computer networks enable communication between devices using layered protocol architectures. The OSI model has 7 layers, while TCP/IP has 4 layers. IPv4 uses 32-bit addresses with subnetting for efficient allocation. Routing protocols determine optimal paths through interconnected networks. TCP provides reliable, connection-oriented service, while UDP offers faster, connectionless communication.",
    database:
      "Database Management Systems organize and manage structured data efficiently. Normalization reduces data redundancy through successive normal forms. SQL provides declarative querying capabilities with various join types. Transactions ensure data consistency through ACID properties. Indexing accelerates query performance, and concurrency control protocols manage simultaneous access.",
  }
  return summaries[matchedTopic] ?? summaries.scheduling
}

export async function generateImportantTopics(content: string): Promise<string[]> {
  await randomDelay()
  const { matchedTopic } = getTopicData(content)
  if (matchedTopic && topicResponses[matchedTopic]) {
    return topicResponses[matchedTopic]
  }
  const keywords = extractKeywords(content)
  if (keywords.length >= 3) {
    return keywords.slice(0, 5).map((k) => `${k.charAt(0).toUpperCase() + k.slice(1)} - Core Concepts and Applications`)
  }
  return [
    "Fundamental Principles and Theories",
    "Practical Applications and Case Studies",
    "Comparative Analysis of Approaches",
    "Recent Developments and Trends",
    "Exam-Oriented Problem Solving Techniques",
  ]
}

export async function generateMCQs(content: string, count = 5): Promise<MCQ[]> {
  await randomDelay()
  const { matchedTopic } = getTopicData(content)

  const mcqBank: Record<string, MCQ[]> = {
    deadlock: [
      { question: "Which of the following is NOT a necessary condition for deadlock?", options: ["Mutual Exclusion", "Hold and Wait", "Preemptive Scheduling", "Circular Wait"], answer: 2 },
      { question: "The Banker's Algorithm is used for:", options: ["Deadlock Prevention", "Deadlock Avoidance", "Deadlock Detection", "Deadlock Recovery"], answer: 1 },
      { question: "A Resource Allocation Graph contains cycles. This indicates:", options: ["Deadlock has definitely occurred", "Deadlock may have occurred", "No deadlock possible", "System is in safe state"], answer: 1 },
      { question: "Which deadlock recovery method involves killing a process?", options: ["Resource Preemption", "Process Termination", "Rollback", "Wait-Die"], answer: 1 },
      { question: "How many processes must be involved in a circular wait for deadlock?", options: ["At least 1", "At least 2", "At least 3", "Exactly 4"], answer: 1 },
    ],
    scheduling: [
      { question: "Which scheduling algorithm minimizes average waiting time?", options: ["FCFS", "SJF", "Round Robin", "Priority Scheduling"], answer: 1 },
      { question: "The convoy effect is associated with which algorithm?", options: ["SJF", "Round Robin", "FCFS", "Multilevel Queue"], answer: 2 },
      { question: "In Round Robin scheduling, a very large time quantum makes it behave like:", options: ["SJF", "FCFS", "Priority Scheduling", "Multilevel Feedback Queue"], answer: 1 },
      { question: "Starvation is most likely in which scheduling algorithm?", options: ["Round Robin", "FCFS", "Priority Scheduling", "SJF"], answer: 2 },
      { question: "Multilevel Feedback Queue scheduling allows:", options: ["Processes to move between queues", "Only one queue level", "No preemption", "Fixed priority forever"], answer: 0 },
    ],
    memory: [
      { question: "Which page replacement algorithm suffers from Belady's Anomaly?", options: ["LRU", "Optimal", "FIFO", "Clock"], answer: 2 },
      { question: "The working set model is used to prevent:", options: ["Fragmentation", "Thrashing", "Deadlock", "Starvation"], answer: 1 },
      { question: "In paged memory, address translation uses:", options: ["Base and Limit registers", "Page Table", "Segment Table", "TLB only"], answer: 1 },
      { question: "Demand paging loads pages:", options: ["At process creation", "When they are referenced", "In advance", "All at once"], answer: 1 },
      { question: "Which is true about internal fragmentation?", options: ["Occurs in paging", "Occurs in segmentation", "Occurs in both", "Occurs in neither"], answer: 0 },
    ],
    process: [
      { question: "Which system call creates a new process in UNIX?", options: ["exec()", "fork()", "wait()", "exit()"], answer: 1 },
      { question: "Process Control Block (PCB) contains all EXCEPT:", options: ["Process State", "Program Counter", "Source Code", "Register Values"], answer: 2 },
      { question: "Context switching involves:", options: ["Saving and restoring process state", "Creating new processes", "Terminating processes", "Allocating memory"], answer: 0 },
      { question: "Which IPC mechanism allows fastest communication?", options: ["Pipes", "Message Queues", "Shared Memory", "Sockets"], answer: 2 },
      { question: "Zombie process is one that:", options: ["Has terminated but PCB remains", "Is in infinite loop", "Has no parent", "Is waiting for I/O"], answer: 0 },
    ],
    java: [
      { question: "Which principle is NOT a pillar of OOP?", options: ["Encapsulation", "Inheritance", "Compilation", "Polymorphism"], answer: 2 },
      { question: "The finally block in exception handling:", options: ["Always executes", "Executes only if exception occurs", "Executes only if no exception", "Is optional and rarely used"], answer: 0 },
      { question: "Which collection does NOT allow duplicate elements?", options: ["ArrayList", "LinkedList", "HashSet", "HashMap"], answer: 2 },
      { question: "A lambda expression in Java is used for:", options: ["Looping", "Functional interfaces", "Exception handling", "Array declaration"], answer: 1 },
      { question: "The start() method on a Thread object:", options: ["Creates a new thread and runs it", "Runs on the current thread", "Pauses the thread", "Destroys the thread"], answer: 0 },
    ],
    network: [
      { question: "Which layer of OSI model handles routing?", options: ["Data Link", "Network", "Transport", "Session"], answer: 1 },
      { question: "TCP is a ________ protocol.", options: ["Connectionless", "Connection-Oriented", "Unreliable", "Best-effort"], answer: 1 },
      { question: "IP address 192.168.1.1 belongs to which class?", options: ["Class A", "Class B", "Class C", "Class D"], answer: 2 },
      { question: "Which protocol is used for email transmission?", options: ["FTP", "HTTP", "SMTP", "DNS"], answer: 2 },
      { question: "Subnet mask 255.255.255.0 provides how many host addresses?", options: ["254", "256", "255", "128"], answer: 0 },
    ],
    database: [
      { question: "Which normal form eliminates transitive dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], answer: 2 },
      { question: "INNER JOIN returns:", options: ["Only matching rows", "All rows from left table", "All rows from both tables", "Only non-matching rows"], answer: 0 },
      { question: "ACID stands for:", options: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Integrity, Data", "Atomic, Concurrent, Isolated, Durable", "Accuracy, Consistency, Isolation, Durability"], answer: 0 },
      { question: "Which index type is best for range queries?", options: ["Hash Index", "B-Tree Index", "Bitmap Index", "Clustered Index"], answer: 1 },
      { question: "Two-Phase Locking (2PL) guarantees:", options: ["Deadlock freedom", "Serializability", "No starvation", "Faster execution"], answer: 1 },
    ],
  }

  const matchedBank = matchedTopic && mcqBank[matchedTopic] ? mcqBank[matchedTopic] : null
  if (matchedBank) {
    return matchedBank.slice(0, count)
  }

  const keywords = extractKeywords(content)
  return [
    {
      question: `What is the primary characteristic of ${keywords[0] ?? "this concept"}?`,
      options: ["Theoretical foundation", "Practical implementation", "Both theoretical and practical aspects", "Neither"],
      answer: 2,
    },
    {
      question: `Which of the following best describes ${keywords[1] ?? "the main topic"}?`,
      options: ["A type of algorithm", "A system component", "A design pattern", "A theoretical framework"],
      answer: 0,
    },
    {
      question: `How does ${keywords[2] ?? "this approach"} improve system performance?`,
      options: ["By reducing overhead", "By increasing complexity", "By eliminating all errors", "By using more resources"],
      answer: 0,
    },
    {
      question: `What is the main advantage of ${keywords[0] ?? "standard approaches"}?`,
      options: ["Simplicity", "Efficiency", "Scalability", "All of the above"],
      answer: 3,
    },
    {
      question: `Which technique is commonly used with ${keywords[1] ?? "this topic"}?`,
      options: ["Optimization", "Standardization", "Automation", "Integration"],
      answer: 0,
    },
  ]
}

export async function generateRevisionSuggestions(content: string): Promise<string[]> {
  await randomDelay()
  const { matchedTopic } = getTopicData(content)
  const baseSuggestions = [
    "Create mind maps connecting key concepts for better visual recall",
    "Practice previous year question papers under timed conditions",
    "Form study groups to discuss and explain concepts to peers",
    "Use spaced repetition techniques for long-term retention",
    "Watch video tutorials for complex topics you find challenging",
    "Write concise notes in your own words to reinforce learning",
    "Take regular breaks using the Pomodoro technique (25/5 minutes)",
    "Focus on understanding 'why' behind concepts, not just 'what'",
    "Create flashcards for definitions, formulas, and key terms",
    "Solve numerical problems and case studies related to each topic",
  ]

  if (matchedTopic) {
    const topicSpecific = [
      `Review ${matchedTopic} concepts thoroughly and create comparison charts`,
      `Focus on numerical problems related to ${matchedTopic}`,
      `Understand real-world applications of ${matchedTopic} in modern systems`,
      `Create step-by-step solution templates for ${matchedTopic} problems`,
    ]
    return [...topicSpecific, ...baseSuggestions.slice(0, 6)]
  }

  const keywords = extractKeywords(content)
  if (keywords.length > 0) {
    return [
      `Prioritize revision of ${keywords.slice(0, 3).join(", ")}`,
      `Create summary sheets for each major topic area`,
      ...baseSuggestions.slice(0, 4),
    ]
  }
  return baseSuggestions.slice(0, 5)
}

export async function generateImportantQuestions(content: string): Promise<string[]> {
  await randomDelay()
  const { matchedTopic } = getTopicData(content)

  const questionBank: Record<string, string[]> = {
    deadlock: [
      "Explain the four necessary conditions for deadlock with examples.",
      "Describe the Banker's Algorithm for deadlock avoidance with a step-by-step example.",
      "Compare and contrast deadlock prevention, avoidance, detection, and recovery strategies.",
      "What is a Resource Allocation Graph? How is it used for deadlock detection?",
      "Explain the difference between safe and unsafe states in deadlock avoidance.",
    ],
    scheduling: [
      "Compare FCFS, SJF, and Round Robin scheduling algorithms with examples.",
      "What is the convoy effect and how does it impact system performance?",
      "Explain the Multilevel Feedback Queue scheduling algorithm in detail.",
      "How does the choice of time quantum affect Round Robin scheduling performance?",
      "Describe how priority scheduling can lead to starvation and how aging solves it.",
    ],
    memory: [
      "Explain the difference between paging and segmentation memory management schemes.",
      "Describe the Optimal, FIFO, and LRU page replacement algorithms with examples.",
      "What is Belady's Anomaly and which algorithm does it affect?",
      "Explain the concept of virtual memory and how demand paging implements it.",
      "What is thrashing? How does the Working Set Model help prevent it?",
    ],
    process: [
      "Describe the five-state process model with a state transition diagram.",
      "What is a Process Control Block and what information does it contain?",
      "Explain the difference between a process and a thread.",
      "Describe three IPC mechanisms used in operating systems.",
      "What happens during a context switch and what overhead does it introduce?",
    ],
    java: [
      "Explain the four pillars of Object-Oriented Programming with Java examples.",
      "How does exception handling work in Java? Explain try, catch, finally, and throw.",
      "Compare ArrayList, LinkedList, and HashSet in the Java Collections Framework.",
      "Explain how multithreading is achieved in Java using Thread and Runnable.",
      "What are lambda expressions and how do they enable functional programming in Java?",
    ],
    network: [
      "Compare the OSI and TCP/IP reference models layer by layer.",
      "Explain IPv4 addressing and subnetting with examples.",
      "Describe how TCP ensures reliable data transmission.",
      "Compare distance vector and link state routing protocols.",
      "What is a firewall and how does it contribute to network security?",
    ],
    database: [
      "Explain the process of normalization from 1NF to BCNF with examples.",
      "Describe the different types of SQL joins with examples.",
      "What are ACID properties and why are they important in transactions?",
      "Compare B-Tree and Hash indexing techniques.",
      "Explain lock-based concurrency control protocols in databases.",
    ],
  }

  if (matchedTopic && questionBank[matchedTopic]) {
    return questionBank[matchedTopic]
  }

  const keywords = extractKeywords(content)
  if (keywords.length >= 2) {
    return [
      `Explain the concept of ${keywords[0]} and its importance in ${keywords[1] ?? "this field"}.`,
      `Compare and contrast different approaches to ${keywords[0]}.`,
      `Describe the practical applications of ${keywords.slice(0, 3).join(", ")}.`,
      `What are the advantages and limitations of ${keywords[0] ?? "these techniques"}?`,
      `Discuss recent developments and future trends in ${keywords[0] ?? "this area"}.`,
    ]
  }
  return [
    "Explain the fundamental concepts covered in this topic with examples.",
    "Compare different approaches and techniques used in this domain.",
    "Discuss the practical applications and real-world relevance of these concepts.",
    "Analyze the advantages and limitations of the methods discussed.",
    "Describe how these concepts relate to and build upon each other.",
  ]
}

export async function improveNotes(content: string): Promise<string[]> {
  await randomDelay()
  const { matchedTopic } = getTopicData(content)

  const suggestions: string[] = []

  if (content.length < 200) {
    suggestions.push("Expand your notes with more detailed explanations and examples for each concept.")
  }
  if (!/for example|e\.g\.|such as|like|instance/i.test(content)) {
    suggestions.push("Add concrete examples and real-world analogies to make abstract concepts easier to understand.")
  }
  if (!/diagram|figure|table|chart|graph/i.test(content)) {
    suggestions.push("Include diagrams, flowcharts, or tables to visually represent relationships between concepts.")
  }
  if (!content.includes("\n\n") && content.length > 300) {
    suggestions.push("Break your notes into smaller paragraphs with clear section headings for better readability.")
  }
  if (matchedTopic) {
    suggestions.push(`Add comparisons between different ${matchedTopic} techniques or algorithms to highlight trade-offs.`)
    suggestions.push(`Include common mistakes and misconceptions about ${matchedTopic} that students often encounter.`)
  }
  if (!/\b(define|explain|describe|compare|analyze|summarize)\b/i.test(content)) {
    suggestions.push("Use action-oriented language and define key terms explicitly when they first appear.")
  }
  suggestions.push("Add quick reference code snippets or pseudocode for algorithms and important procedures.")
  suggestions.push("Create a glossary section at the end defining all technical terms used in your notes.")
  suggestions.push("Include practice questions at the end of each section to test understanding.")
  suggestions.push("Add cross-references to related topics and prerequisite concepts for better context.")

  return suggestions
}

export async function generateAll(content: string): Promise<AIAssistResult> {
  await randomDelay()
  const [summary, importantTopics, mcqs, revisionSuggestions, importantQuestions, improvements] =
    await Promise.all([
      generateSummary(content),
      generateImportantTopics(content),
      generateMCQs(content),
      generateRevisionSuggestions(content),
      generateImportantQuestions(content),
      improveNotes(content),
    ])
  return { summary, importantTopics, mcqs, revisionSuggestions, importantQuestions, improvements }
}
