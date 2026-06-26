import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';

dotenv.config();

const subjectsList = [
  'Algorithms & Data Structures',
  'Software Engineering',
  'Database Management Systems',
  'Computer Networks',
  'Artificial Intelligence',
];

const seed = async () => {
  try {
    console.log('Cleaning database...');
    
    // Clear existing data in correct order to avoid foreign key violations
    await prisma.timetable.deleteMany({});
    await prisma.attendance.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.note.deleteMany({});
    await prisma.notice.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('All tables cleared.');

    // 1. Seed Users
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminUser = await prisma.user.create({
      data: {
        name: 'Dr. Sarah Jenkins',
        email: 'admin@campus.edu',
        password: hashedPassword,
        role: 'admin',
        avatar: 'avatar5',
      },
    });

    const studentUser = await prisma.user.create({
      data: {
        name: 'Alex Mercer',
        email: 'student@campus.edu',
        password: hashedPassword,
        role: 'student',
        avatar: 'avatar1',
      },
    });
    console.log('Users seeded successfully.');

    const studentId = studentUser.id;
    const adminId = adminUser.id;

    // 2. Seed Timetable
    console.log('Seeding timetable schedules...');
    const schedules = [
      {
        studentId,
        subject: 'Algorithms & Data Structures',
        room: 'Lab 3A',
        teacher: 'Dr. Robert Carter',
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '10:30',
        color: '#0d9488',
      },
      {
        studentId,
        subject: 'Software Engineering',
        room: 'Lecture Hall 102',
        teacher: 'Prof. Helen Smith',
        dayOfWeek: 'Monday',
        startTime: '11:00',
        endTime: '12:30',
        color: '#3b82f6',
      },
      {
        studentId,
        subject: 'Database Management Systems',
        room: 'Seminar Room 204',
        teacher: 'Dr. Sarah Jenkins',
        dayOfWeek: 'Tuesday',
        startTime: '10:00',
        endTime: '11:30',
        color: '#8b5cf6',
      },
      {
        studentId,
        subject: 'Computer Networks',
        room: 'Lab 2B',
        teacher: 'Prof. Alan Turing',
        dayOfWeek: 'Wednesday',
        startTime: '09:00',
        endTime: '10:30',
        color: '#f43f5e',
      },
      {
        studentId,
        subject: 'Artificial Intelligence',
        room: 'Lecture Hall 105',
        teacher: 'Dr. Grace Hopper',
        dayOfWeek: 'Thursday',
        startTime: '13:00',
        endTime: '14:30',
        color: '#eab308',
      },
      {
        studentId,
        subject: 'Algorithms & Data Structures',
        room: 'Lab 3A',
        teacher: 'Dr. Robert Carter',
        dayOfWeek: 'Friday',
        startTime: '09:00',
        endTime: '10:30',
        color: '#0d9488',
      },
      {
        studentId,
        subject: 'Computer Networks',
        room: 'Lab 2B',
        teacher: 'Prof. Alan Turing',
        dayOfWeek: 'Friday',
        startTime: '11:00',
        endTime: '12:30',
        color: '#f43f5e',
      },
    ];
    await prisma.timetable.createMany({ data: schedules });
    console.log('Timetables seeded successfully.');

    // 3. Seed Tasks
    console.log('Seeding tasks...');
    const now = new Date();
    const tasks = [
      {
        studentId,
        title: 'Algorithms Homework 4',
        description: 'Complete the graph traversals implementation in Python.',
        dueDate: new Date(new Date().setDate(now.getDate() + 2)),
        completed: false,
        priority: 'high',
        attachments: [],
      },
      {
        studentId,
        title: 'DBMS Project Milestone 2',
        description: 'Submit ER diagram and normalizations schema document.',
        dueDate: new Date(new Date().setDate(now.getDate() + 5)),
        completed: false,
        priority: 'high',
        attachments: [],
      },
      {
        studentId,
        title: 'Software Engineering Quiz Preparation',
        description: 'Read Chapter 4 on Agile and Scrum methodologies.',
        dueDate: new Date(new Date().setDate(now.getDate() - 1)),
        completed: true,
        priority: 'medium',
        attachments: [],
      },
      {
        studentId,
        title: 'Computer Networks Lab 3 Write-up',
        description: 'Submit packet analysis report using Wireshark traces.',
        dueDate: new Date(new Date().setDate(now.getDate() + 1)),
        completed: false,
        priority: 'medium',
        attachments: [],
      },
      {
        studentId,
        title: 'AI Ethics Short Essay',
        description: 'Write a 500-word essay detailing safety guidelines in generative AI models.',
        dueDate: new Date(new Date().setDate(now.getDate() + 10)),
        completed: false,
        priority: 'low',
        attachments: [],
      },
    ];
    await prisma.task.createMany({ data: tasks });
    console.log('Tasks seeded successfully.');

    // 4. Seed Attendance
    console.log('Seeding attendance log statistics...');
    const attendanceLogs: any[] = [];

    for (let i = 15; i >= 1; i--) {
      const date = new Date(new Date().setDate(now.getDate() - i));
      date.setHours(0, 0, 0, 0);

      subjectsList.forEach((sub) => {
        if (Math.random() < 0.15) return;

        let status = 'present';
        const rand = Math.random();
        if (rand < 0.15) {
          status = 'absent';
        } else if (rand < 0.20) {
          status = 'cancelled';
        }

        attendanceLogs.push({
          studentId,
          subject: sub,
          status,
          date,
          note: status === 'absent' ? 'Doctor appointment / Woke up late' : '',
        });
      });
    }
    await prisma.attendance.createMany({ data: attendanceLogs });
    console.log('Attendance logs seeded successfully.');

    // 5. Seed Notices
    console.log('Seeding campus notices...');
    const notices = [
      {
        authorId: adminId,
        authorName: adminUser.name,
        title: 'End Semester Examination Schedule Released',
        content: 'The examination schedule for the Spring 2026 term has been finalized. Theory exams will commence on July 10, 2026. Please check your student portal for specific subject timings and venue allocations.',
        targetDepartment: 'All',
        pinned: true,
      },
      {
        authorId: adminId,
        authorName: adminUser.name,
        title: 'Campus Wi-Fi Maintenance Notice',
        content: 'Please note that the central campus server and Wi-Fi system will undergo routine updates on Saturday, June 28, 2026, from 02:00 AM to 06:00 AM. System services might be temporarily disrupted.',
        targetDepartment: 'All',
        pinned: false,
      },
      {
        authorId: adminId,
        authorName: adminUser.name,
        title: 'Special Hackathon Guest Lecture',
        content: 'The Department of Computer Science is hosting a guest lecture on "Building scalable SaaS applications in 2026" by a Google DeepMind developer. Location: Seminar Room A, 2:00 PM onwards.',
        targetDepartment: 'Computer Science',
        pinned: false,
      },
    ];
    await prisma.notice.createMany({ data: notices });
    console.log('Notices seeded successfully.');

    // 6. Seed Notes
    console.log('Seeding student notes...');
    const notes = [
      {
        studentId,
        title: 'Project Ideas: Smart Trash Can',
        content: 'IoT project using Arduino/Raspberry Pi. Needs a distance sensor, servo motor for automatic lid, and ESP8266 for network dashboard alerts.',
        tags: ['IoT', 'Personal'],
        color: '#fef08a',
      },
      {
        studentId,
        title: 'Algorithms: BFS vs DFS complexity',
        content: 'BFS: uses Queue. O(V + E) complexity. Finds shortest path in unweighted graphs.\nDFS: uses Stack/Recursion. O(V + E). Good for topology sorting, cycle detection, maze solving.',
        tags: ['Study', 'Algorithms'],
        color: '#bfdbfe',
      },
      {
        studentId,
        title: 'Groceries / Room Checklist',
        content: '- Buy notebook binders\n- Laundry detergent\n- Instant coffee packs\n- Recharge transit card',
        tags: ['Todo', 'Life'],
        color: '#bbf7d0',
      },
    ];
    await prisma.note.createMany({ data: notes });
    console.log('Notes seeded successfully.');

    console.log('Database seeding process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seed:', error);
    process.exit(1);
  }
};

seed();
