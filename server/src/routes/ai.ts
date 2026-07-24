import { Router } from "express"

export default function aiRoutes() {
  const router = Router()

  router.post("/summary", async (req, res) => {
    const { content } = req.body
    const summary = generateMockSummary(content || "")
    res.json({ summary })
  })

  router.post("/questions", async (req, res) => {
    const { content } = req.body
    const questions = generateMockQuestions(content || "")
    res.json({ questions })
  })

  router.post("/mcqs", async (req, res) => {
    const { content, count = 5 } = req.body
    const mcqs = generateMockMCQs(content || "", count)
    res.json({ mcqs })
  })

  router.post("/improve", async (req, res) => {
    const { content } = req.body
    const suggestions = generateMockImprovements(content || "")
    res.json({ suggestions })
  })

  router.post("/topics", async (req, res) => {
    const { content } = req.body
    const topics = generateMockTopics(content || "")
    res.json({ topics })
  })

  return router
}

function generateMockSummary(content: string): string {
  const topics = content.toLowerCase()
  if (topics.includes("deadlock")) {
    return "Deadlock is a situation where two or more processes are unable to proceed because each is waiting for a resource held by the other. Key concepts include: Necessary Conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait), Deadlock Prevention, Deadlock Avoidance (Banker's Algorithm), Deadlock Detection, and Recovery methods."
  }
  if (topics.includes("cpu") || topics.includes("scheduling")) {
    return "CPU Scheduling is the process by which the operating system selects which process to execute next. Main algorithms include: FCFS (First Come First Serve), SJF (Shortest Job First), Round Robin, and Priority Scheduling. Key concepts include throughput, turnaround time, waiting time, and response time."
  }
  if (topics.includes("network") || topics.includes("tcp") || topics.includes("ip")) {
    return "Computer Networking involves the interconnection of computers for data sharing. Key layers: Application, Transport (TCP/UDP), Network (IP), Data Link, and Physical. TCP provides reliable, connection-oriented communication while UDP provides faster, connectionless communication."
  }
  if (topics.includes("java") || topics.includes("oop")) {
    return "Java is an object-oriented programming language. Key concepts: Classes and Objects, Inheritance, Polymorphism, Encapsulation, Abstraction, Exception Handling, Collections Framework, and Multithreading."
  }
  if (topics.includes("database") || topics.includes("sql") || topics.includes("dbms")) {
    return "Database Management Systems (DBMS) provide structured data storage and retrieval. Key concepts: Relational Model, SQL Queries, Normalization (1NF, 2NF, 3NF), ACID properties, Transactions, and Indexing."
  }
  return "This content covers important academic topics. Key concepts include fundamental principles, practical applications, and theoretical foundations. Review the material and practice with exercises for better understanding."
}

function generateMockQuestions(content: string): string[] {
  const topics = content.toLowerCase()
  if (topics.includes("deadlock")) {
    return [
      "What are the four necessary conditions for deadlock?",
      "Explain the Banker's Algorithm for deadlock avoidance.",
      "What is the difference between deadlock prevention and deadlock avoidance?",
      "How does the OS detect deadlock in a system?",
      "Compare and contrast deadlock recovery methods.",
    ]
  }
  if (topics.includes("cpu") || topics.includes("scheduling")) {
    return [
      "Explain the FCFS scheduling algorithm with an example.",
      "What is the convoy effect in SJF scheduling?",
      "How does Round Robin scheduling ensure fairness?",
      "Calculate the average waiting time for Priority Scheduling.",
      "Compare preemptive and non-preemptive scheduling.",
    ]
  }
  if (topics.includes("network")) {
    return [
      "Explain the OSI model layers and their functions.",
      "What is the difference between TCP and UDP?",
      "How does IP addressing work in IPv4?",
      "Explain the concept of subnetting.",
      "What is the purpose of the transport layer?",
    ]
  }
  if (topics.includes("java")) {
    return [
      "Explain the four pillars of OOP in Java.",
      "What is the difference between abstract classes and interfaces?",
      "How does exception handling work in Java?",
      "Explain the Java Collections Framework.",
      "What is multithreading and how is it achieved in Java?",
    ]
  }
  return [
    "What are the key concepts covered in this topic?",
    "Explain the practical applications of this subject.",
    "How does this topic relate to other subjects in the curriculum?",
    "What are the common challenges or problems in this area?",
    "Describe the evolution or history of this concept.",
  ]
}

function generateMockMCQs(content: string, count: number): { question: string; options: string[]; answer: number }[] {
  const allMcqs = [
    {
      question: "What is the primary purpose of an operating system?",
      options: ["Run applications", "Manage hardware resources", "Browse the internet", "Edit documents"],
      answer: 1,
    },
    {
      question: "Which scheduling algorithm assigns the CPU to the process with the smallest burst time?",
      options: ["FCFS", "Round Robin", "SJF", "Priority Scheduling"],
      answer: 2,
    },
    {
      question: "What does TCP stand for?",
      options: ["Transmission Control Protocol", "Transfer Control Protocol", "Transport Communication Protocol", "Terminal Control Protocol"],
      answer: 0,
    },
    {
      question: "Which of the following is NOT a deadlock condition?",
      options: ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"],
      answer: 2,
    },
    {
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      answer: 1,
    },
    {
      question: "Which Java keyword is used to inherit a class?",
      options: ["implements", "extends", "inherit", "super"],
      answer: 1,
    },
    {
      question: "What is the full form of SQL?",
      options: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "Sequential Query Language"],
      answer: 0,
    },
    {
      question: "Which network layer handles routing?",
      options: ["Application Layer", "Transport Layer", "Network Layer", "Data Link Layer"],
      answer: 2,
    },
  ]
  return allMcqs.slice(0, count)
}

function generateMockImprovements(content: string): string[] {
  const topics = content.toLowerCase()
  const suggestions: string[] = []

  if (topics.length < 50) {
    suggestions.push("Add more detail to your notes. Consider explaining each concept with examples.")
  }

  if (topics.includes("deadlock")) {
    suggestions.push("Add the Banker's Algorithm example with a step-by-step explanation.")
    suggestions.push("Include a diagram showing the deadlock cycle.")
    suggestions.push("Add real-world analogies for each deadlock condition.")
  }
  if (topics.includes("cpu") || topics.includes("scheduling")) {
    suggestions.push("Include a comparison table of all scheduling algorithms.")
    suggestions.push("Add numerical examples calculating waiting time and turnaround time.")
  }
  if (topics.includes("network")) {
    suggestions.push("Include a diagram of the OSI model layers.")
    suggestions.push("Add a comparison table of TCP vs UDP.")
  }
  if (topics.includes("java")) {
    suggestions.push("Add code examples for each OOP concept.")
    suggestions.push("Include a comparison of ArrayList vs LinkedList.")
  }

  suggestions.push("Review the topics and practice with previous exam questions.")
  suggestions.push("Create mind maps connecting related concepts.")

  return suggestions
}

function generateMockTopics(content: string): string[] {
  const topics = content.toLowerCase()
  if (topics.includes("deadlock")) {
    return ["Deadlock Prevention", "Deadlock Avoidance", "Banker's Algorithm", "Deadlock Detection", "Recovery Methods", "Necessary Conditions"]
  }
  if (topics.includes("cpu") || topics.includes("scheduling")) {
    return ["FCFS Scheduling", "SJF Scheduling", "Round Robin", "Priority Scheduling", "Multilevel Queue", "Throughput & Turnaround Time"]
  }
  if (topics.includes("network")) {
    return ["OSI Model", "TCP/IP Protocol Suite", "IP Addressing", "Subnetting", "Routing Protocols", "Network Security"]
  }
  return ["Core Concepts", "Key Definitions", "Important Algorithms", "Practical Applications", "Recent Developments"]
}
