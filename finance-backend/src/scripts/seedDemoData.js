require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/user.model');
const Record = require('../models/record.model');

const ensureUser = async ({ name, email, password, role, status = 'active' }) => {
  let user = await User.findOne({ email }).select('+password');

  if (!user) {
    user = await User.create({ name, email, password, role, status });
    return user;
  }

  let shouldSave = false;

  if (user.name !== name) {
    user.name = name;
    shouldSave = true;
  }

  if (user.role !== role) {
    user.role = role;
    shouldSave = true;
  }

  if (user.status !== status) {
    user.status = status;
    shouldSave = true;
  }

  if (password) {
    user.password = password;
    shouldSave = true;
  }

  if (shouldSave) {
    await user.save();
  }

  return user;
};

const run = async () => {
  await connectDB();

  const admin = await ensureUser({
    name: 'Demo Admin',
    email: 'admin.demo@finance.local',
    password: 'Pass@1234',
    role: 'admin',
  });

  const analyst = await ensureUser({
    name: 'Demo Analyst',
    email: 'analyst.demo@finance.local',
    password: 'Pass@1234',
    role: 'analyst',
  });

  const viewer = await ensureUser({
    name: 'Demo Viewer',
    email: 'viewer.demo@finance.local',
    password: 'Pass@1234',
    role: 'viewer',
  });

  const otherViewer = await ensureUser({
    name: 'Demo Viewer 2',
    email: 'viewer2.demo@finance.local',
    password: 'Pass@1234',
    role: 'viewer',
  });

  const seededUserIds = [admin._id, analyst._id, viewer._id, otherViewer._id];

  await Record.deleteMany({ userId: { $in: seededUserIds } });

  const seedRecords = [
    { userId: viewer._id, amount: 4200, type: 'income', category: 'salary', date: '2026-01-02', notes: 'Monthly salary' },
    { userId: viewer._id, amount: 260, type: 'expense', category: 'housing', date: '2026-01-05', notes: 'Utilities payment' },
    { userId: viewer._id, amount: 190, type: 'expense', category: 'personal', date: '2026-01-11', notes: 'Health and wellness' },
    { userId: viewer._id, amount: 120, type: 'expense', category: 'transportation', date: '2026-01-15', notes: 'Fuel and ride share' },

    { userId: analyst._id, amount: 5100, type: 'income', category: 'salary', date: '2026-02-01', notes: 'Consulting payout' },
    { userId: analyst._id, amount: 340, type: 'expense', category: 'housing', date: '2026-02-04', notes: 'Rent contribution' },
    { userId: analyst._id, amount: 210, type: 'expense', category: 'personal', date: '2026-02-10', notes: 'Education subscription' },
    { userId: analyst._id, amount: 95, type: 'expense', category: 'transportation', date: '2026-02-18', notes: 'Metro and cabs' },

    { userId: otherViewer._id, amount: 3800, type: 'income', category: 'salary', date: '2026-03-02', notes: 'Primary income' },
    { userId: otherViewer._id, amount: 310, type: 'expense', category: 'housing', date: '2026-03-07', notes: 'Home maintenance' },
    { userId: otherViewer._id, amount: 170, type: 'expense', category: 'personal', date: '2026-03-12', notes: 'Family shopping' },
    { userId: otherViewer._id, amount: 140, type: 'expense', category: 'transportation', date: '2026-03-20', notes: 'Vehicle servicing' },

    { userId: admin._id, amount: 9000, type: 'income', category: 'business', date: '2026-03-01', notes: 'Admin business income' },
    { userId: admin._id, amount: 600, type: 'expense', category: 'housing', date: '2026-03-05', notes: 'Property tax' },
  ];

  await Record.insertMany(seedRecords.map((item) => ({ ...item, date: new Date(item.date) })));

  const totals = await Record.countDocuments({ userId: { $in: seededUserIds } });

  console.log(
    JSON.stringify(
      {
        message: 'Demo data seeded successfully',
        users: {
          admin: admin.email,
          analyst: analyst.email,
          viewer: viewer.email,
          viewer2: otherViewer.email,
        },
        seededRecords: totals,
      },
      null,
      2
    )
  );
};

run()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
