// ============================================================
// Database Seeder — Create initial data for testing
// ============================================================

require('dotenv').config();

const { sequelize, User, Content, ContentSlot, ContentSchedule } = require('../models');
const { ROLES, CONTENT_STATUS, SUBJECTS } = require('../utils/constants');
const bcrypt = require('bcryptjs');

/**
 * Seed the database with:
 * - 1 Principal
 * - 3 Teachers
 * - Sample content per teacher (various statuses)
 * - Content slots and schedules
 */
async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Sync database
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // WARNING: drops all tables
    console.log('✅ Database synced (tables recreated).\n');

    // ---- Create Users ----
    const principal = await User.create({
      name: 'Dr. Sarah Principal',
      email: 'principal@school.edu',
      password_hash: 'password123',
      role: ROLES.PRINCIPAL,
    });
    console.log(`👤 Principal created: ${principal.email}`);

    const teacher1 = await User.create({
      name: 'Mr. Adams (Maths)',
      email: 'teacher1@school.edu',
      password_hash: 'password123',
      role: ROLES.TEACHER,
    });
    console.log(`👤 Teacher created: ${teacher1.email}`);

    const teacher2 = await User.create({
      name: 'Mrs. Baker (Science)',
      email: 'teacher2@school.edu',
      password_hash: 'password123',
      role: ROLES.TEACHER,
    });
    console.log(`👤 Teacher created: ${teacher2.email}`);

    const teacher3 = await User.create({
      name: 'Ms. Clark (English)',
      email: 'teacher3@school.edu',
      password_hash: 'password123',
      role: ROLES.TEACHER,
    });
    console.log(`👤 Teacher created: ${teacher3.email}\n`);

    // ---- Create Content Slots ----
    const mathsSlot = await ContentSlot.create({ subject: 'maths' });
    const scienceSlot = await ContentSlot.create({ subject: 'science' });
    const englishSlot = await ContentSlot.create({ subject: 'english' });
    console.log('📋 Content slots created: maths, science, english\n');

    // ---- Create Sample Content ----
    // Time window: from now to 7 days from now
    const now = new Date();
    const startTime = new Date(now);
    const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Teacher 1 — Maths content (3 approved, 1 pending, 1 rejected)
    const mathsContent = [];
    for (let i = 1; i <= 3; i++) {
      const content = await Content.create({
        title: `Maths Chapter ${i} - Question Paper`,
        description: `Question paper for Chapter ${i} covering algebra and geometry topics.`,
        subject: 'maths',
        file_url: `/uploads/sample-maths-${i}.jpg`,
        file_type: 'image/jpeg',
        file_size: 1024 * 500 * i,
        uploaded_by: teacher1.id,
        status: CONTENT_STATUS.APPROVED,
        approved_by: principal.id,
        approved_at: new Date(),
        start_time: startTime,
        end_time: endTime,
        rotation_duration: 5,
      });
      mathsContent.push(content);
    }

    // Pending content
    await Content.create({
      title: 'Maths Chapter 4 - Practice Problems',
      description: 'Practice problems for upcoming exam.',
      subject: 'maths',
      file_url: '/uploads/sample-maths-4.png',
      file_type: 'image/png',
      file_size: 1024 * 800,
      uploaded_by: teacher1.id,
      status: CONTENT_STATUS.PENDING,
      start_time: startTime,
      end_time: endTime,
      rotation_duration: 5,
    });

    // Rejected content
    await Content.create({
      title: 'Maths - Wrong File',
      description: 'Accidentally uploaded wrong file.',
      subject: 'maths',
      file_url: '/uploads/sample-maths-wrong.gif',
      file_type: 'image/gif',
      file_size: 1024 * 200,
      uploaded_by: teacher1.id,
      status: CONTENT_STATUS.REJECTED,
      rejection_reason: 'Incorrect content. Please re-upload with the correct question paper.',
      approved_by: principal.id,
      rotation_duration: 5,
    });

    console.log('📝 Teacher 1 content created (3 approved, 1 pending, 1 rejected)');

    // Teacher 2 — Science content (2 approved)
    const scienceContent = [];
    for (let i = 1; i <= 2; i++) {
      const content = await Content.create({
        title: `Science Lab Report ${i}`,
        description: `Lab report template for experiment ${i}.`,
        subject: 'science',
        file_url: `/uploads/sample-science-${i}.png`,
        file_type: 'image/png',
        file_size: 1024 * 600 * i,
        uploaded_by: teacher2.id,
        status: CONTENT_STATUS.APPROVED,
        approved_by: principal.id,
        approved_at: new Date(),
        start_time: startTime,
        end_time: endTime,
        rotation_duration: 10,
      });
      scienceContent.push(content);
    }
    console.log('📝 Teacher 2 content created (2 approved)');

    // Teacher 3 — English content (1 approved, no schedule time = not active)
    await Content.create({
      title: 'English Essay Guidelines',
      description: 'Guidelines for writing the mid-term essay.',
      subject: 'english',
      file_url: '/uploads/sample-english-1.jpg',
      file_type: 'image/jpeg',
      file_size: 1024 * 400,
      uploaded_by: teacher3.id,
      status: CONTENT_STATUS.APPROVED,
      approved_by: principal.id,
      approved_at: new Date(),
      start_time: null, // No scheduling = not active
      end_time: null,
      rotation_duration: 5,
    });
    console.log('📝 Teacher 3 content created (1 approved, no schedule)\n');

    // ---- Create Content Schedules ----
    for (let i = 0; i < mathsContent.length; i++) {
      await ContentSchedule.create({
        content_id: mathsContent[i].id,
        slot_id: mathsSlot.id,
        rotation_order: i + 1,
        duration: 5,
      });
    }

    for (let i = 0; i < scienceContent.length; i++) {
      await ContentSchedule.create({
        content_id: scienceContent[i].id,
        slot_id: scienceSlot.id,
        rotation_order: i + 1,
        duration: 10,
      });
    }
    console.log('📅 Content schedules created\n');

    // ---- Summary ----
    console.log('═══════════════════════════════════════════');
    console.log('   🌱 SEED COMPLETE — Test Credentials');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('   Principal:');
    console.log('     Email:    principal@school.edu');
    console.log('     Password: password123');
    console.log('');
    console.log('   Teacher 1 (Maths):');
    console.log('     Email:    teacher1@school.edu');
    console.log('     Password: password123');
    console.log('');
    console.log('   Teacher 2 (Science):');
    console.log('     Email:    teacher2@school.edu');
    console.log('     Password: password123');
    console.log('');
    console.log('   Teacher 3 (English):');
    console.log('     Email:    teacher3@school.edu');
    console.log('     Password: password123');
    console.log('');
    console.log('   Public Broadcasting URLs:');
    console.log('     GET /api/content/live/2  → Teacher 1 (Maths)');
    console.log('     GET /api/content/live/3  → Teacher 2 (Science)');
    console.log('     GET /api/content/live/4  → Teacher 3 (English)');
    console.log('');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
