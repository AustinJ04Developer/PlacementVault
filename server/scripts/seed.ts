import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { ENV } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { Company } from '../src/models/Company.js';
import { PlacementDrive } from '../src/models/PlacementDrive.js';
import { Category } from '../src/models/Category.js';
import { Question } from '../src/models/Question.js';
import { Answer } from '../src/models/Answer.js';
import { Comment } from '../src/models/Comment.js';
import { Bookmark } from '../src/models/Bookmark.js';
import { Vote } from '../src/models/Vote.js';
import { Report } from '../src/models/Report.js';
import { AuditLog } from '../src/models/AuditLog.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('[Seed] Connected.');

    console.log('[Seed] Purging all demo and sample data...');
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      PlacementDrive.deleteMany({}),
      Category.deleteMany({}),
      Question.deleteMany({}),
      Answer.deleteMany({}),
      Comment.deleteMany({}),
      Bookmark.deleteMany({}),
      Vote.deleteMany({}),
      Report.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[Seed] Creating Administrator account...');
    const admin = await User.create({
      name: 'Placement Officer (Administrator)',
      email: ENV.ADMIN_EMAIL,
      password: ENV.ADMIN_PASSWORD,
      role: 'admin',
      collegeName: 'Campus Training & Placement Cell',
      department: 'Training & Placement Administration',
      status: 'active',
      bio: 'Head of Campus Placements & Industry Relations. Responsible for repository governance, content moderation, and placement analytics.',
    });

    console.log('[Seed] Creating Standard Categories & Interview Topic Taxonomies...');
    const categoriesData = [
      {
        name: 'Coding',
        slug: 'coding',
        topics: [
          'Arrays & Strings',
          'Binary Search & Two Pointers',
          'Dynamic Programming & Memoization',
          'Trees & Graphs (BFS/DFS)',
          'Stack & Queue',
          'Bit Manipulation & Math',
          'Sliding Window & Hash Maps',
        ],
        description: 'Hands-on programming assessments, online tests, and competitive coding problems.',
        order: 1,
      },
      {
        name: 'Data Structures and Algorithms',
        slug: 'data-structures-and-algorithms',
        topics: [
          'Time & Space Complexity Analysis',
          'Recursion & Backtracking',
          'Sorting & Searching Algorithms',
          'Greedy Techniques',
          'Trie & Disjoint Set Union',
          'Heap & Priority Queue',
        ],
        description: 'Algorithmic efficiency, theoretical foundations, and core data structures.',
        order: 2,
      },
      {
        name: 'Aptitude',
        slug: 'aptitude',
        topics: [
          'Quantitative Ability',
          'Logical & Analytical Reasoning',
          'Verbal Ability & Reading Comprehension',
          'Data Interpretation (Charts & Tables)',
          'Puzzles & Series Completion',
        ],
        description: 'First-round cognitive screening, quantitative problem-solving, and general aptitude tests.',
        order: 3,
      },
      {
        name: 'Core Technical Subjects',
        slug: 'core-technical-subjects',
        topics: [
          'Operating Systems (Processes, Threads, Concurrency, Deadlocks, Virtual Memory)',
          'Database Management Systems (SQL Queries, Indexing, ACID, Normalization)',
          'Computer Networks (TCP/IP, HTTP/HTTPS, DNS, Sockets, OSI Model)',
          'Object-Oriented Programming (Polymorphism, Inheritance, Encapsulation, SOLID)',
        ],
        description: 'Core computer science fundamentals, kernel concepts, database systems, and networking.',
        order: 4,
      },
      {
        name: 'System Design & Architecture',
        slug: 'system-design-and-architecture',
        topics: [
          'High-Level Architecture (Load Balancers, Microservices, Caching)',
          'Low-Level Design (Design Patterns, Class Diagrams, Schema Design)',
          'Database Sharding & Replication',
          'Message Queues & Event Streaming (Kafka/RabbitMQ)',
          'API Design (REST, gRPC, WebSockets)',
        ],
        description: 'Scalable software architecture, system design interviews, and distributed systems.',
        order: 5,
      },
      {
        name: 'Technical Interview',
        slug: 'technical-interview',
        topics: [
          'Project Architecture & Deep Dive',
          'Code Walkthrough & Live Debugging',
          'Problem-Solving & Whiteboarding',
          'Domain Specific Concepts (Full-Stack, Cloud, AI/ML, DevOps)',
        ],
        description: 'One-on-one technical discussion rounds with senior engineers and tech leads.',
        order: 6,
      },
      {
        name: 'HR & Behavioral',
        slug: 'hr-and-behavioral',
        topics: [
          'Situational & Behavioral Scenarios (STAR Method)',
          'Company Culture & Values Alignment',
          'Strengths, Weaknesses & Self-Awareness',
          'Career Aspirations & Long-Term Goals',
          'Teamwork, Conflict Resolution & Leadership',
        ],
        description: 'Final-round behavioral assessments, culture-fit evaluations, and HR discussions.',
        order: 7,
      },
      {
        name: 'Group Discussion',
        slug: 'group-discussion',
        topics: [
          'Technology & Innovation Trends',
          'Current Affairs & Economic Topics',
          'Case Studies & Business Scenarios',
          'Abstract & Creative Prompts',
        ],
        description: 'Recruitment GD prompts, group communication topics, and evaluation guidelines.',
        order: 8,
      },
    ];

    await Category.insertMany(categoriesData);

    console.log('[Seed] Database successfully initialized with clean schema!');
    console.log('----------------------------------------------------');
    console.log('Active Administrator Account:');
    console.log(`  Email:    ${ENV.ADMIN_EMAIL}`);
    console.log(`  Password: ${ENV.ADMIN_PASSWORD}`);
    console.log('Categories Seeded:');
    categoriesData.forEach(c => console.log(`  - ${c.name} (${c.topics.length} topics)`));
    console.log('----------------------------------------------------');
    console.log('All sample student accounts and dummy questions have been removed.');
    console.log('The platform is ready for real student and campus recruitment data.');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to initialize database:', error);
    process.exit(1);
  }
};

seedDatabase();
