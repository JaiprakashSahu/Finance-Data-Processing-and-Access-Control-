require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/user.model');
const Record = require('../models/record.model');
const DEFAULT_FALLBACK_VIEWER_ID = '000000000000000000000001';

const PERIODS = [
  { year: 2025, month: 11 },
  { year: 2025, month: 12 },
  { year: 2026, month: 1 },
  { year: 2026, month: 2 },
  { year: 2026, month: 3 },
  { year: 2026, month: 4 },
];

const EXPENSE_CATEGORIES = ['rent', 'food', 'travel'];

const toDate = (year, month, day) => {
  return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
};

const toAmount = (value) => Math.round(value * 100) / 100;

const buildUserRecords = (userId, profile) => {
  return PERIODS.flatMap((period, index) => {
    const incomeAmount = toAmount(profile.baseIncome + index * profile.incomeStep);
    const expenseCategoryA = EXPENSE_CATEGORIES[index % EXPENSE_CATEGORIES.length];
    const expenseCategoryB = EXPENSE_CATEGORIES[(index + 1) % EXPENSE_CATEGORIES.length];

    const expenseAmountA = toAmount(profile.baseIncome * 0.24 + index * 11);
    const expenseAmountB = toAmount(profile.baseIncome * 0.12 + index * 7);

    return [
      {
        userId,
        amount: incomeAmount,
        type: 'income',
        category: profile.incomeCategory,
        date: toDate(period.year, period.month, 2),
        notes: `${profile.name} recurring ${profile.incomeCategory}`,
      },
      {
        userId,
        amount: expenseAmountA,
        type: 'expense',
        category: expenseCategoryA,
        date: toDate(period.year, period.month, 8),
        notes: `${profile.name} ${expenseCategoryA} spend`,
      },
      {
        userId,
        amount: expenseAmountB,
        type: 'expense',
        category: expenseCategoryB,
        date: toDate(period.year, period.month, 17),
        notes: `${profile.name} ${expenseCategoryB} spend`,
      },
    ];
  });
};

const ensureUser = async ({ id, name, email, password, role, status = 'active' }) => {
  let user = null;

  if (id && mongoose.Types.ObjectId.isValid(id)) {
    user = await User.findById(id).select('+password');
  }

  if (!user) {
    user = await User.findOne({ email }).select('+password');
  }

  if (id && user && String(user._id) !== id) {
    await Record.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    user = null;
  }

  if (!user) {
    const createPayload = {
      name,
      email,
      password,
      role,
      status,
    };

    if (id) {
      createPayload._id = id;
    }

    user = await User.create(createPayload);
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

  const fallbackViewer = await ensureUser({
    id: DEFAULT_FALLBACK_VIEWER_ID,
    name: 'Default Demo Viewer',
    email: 'default.viewer@finance.local',
    password: 'Pass@1234',
    role: 'viewer',
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

  const seededUserIds = [admin._id, analyst._id, fallbackViewer._id, viewer._id, otherViewer._id];

  await Record.deleteMany({ userId: { $in: seededUserIds } });

  const userProfiles = [
    {
      id: admin._id,
      name: 'admin',
      baseIncome: 9600,
      incomeStep: 140,
      incomeCategory: 'business',
    },
    {
      id: analyst._id,
      name: 'analyst',
      baseIncome: 6200,
      incomeStep: 95,
      incomeCategory: 'salary',
    },
    {
      id: fallbackViewer._id,
      name: 'defaultViewer',
      baseIncome: 5400,
      incomeStep: 85,
      incomeCategory: 'salary',
    },
    {
      id: viewer._id,
      name: 'viewer',
      baseIncome: 5100,
      incomeStep: 80,
      incomeCategory: 'salary',
    },
    {
      id: otherViewer._id,
      name: 'viewer2',
      baseIncome: 4500,
      incomeStep: 70,
      incomeCategory: 'salary',
    },
  ];

  const seedRecords = userProfiles.flatMap((profile) => {
    return buildUserRecords(profile.id, profile);
  });

  await Record.insertMany(seedRecords);

  const totals = await Record.countDocuments({ userId: { $in: seededUserIds } });
  const recordsPerUser = await Record.aggregate([
    { $match: { userId: { $in: seededUserIds } } },
    {
      $group: {
        _id: '$userId',
        total: { $sum: 1 },
      },
    },
  ]);

  const recordCountMap = new Map(recordsPerUser.map((item) => [String(item._id), item.total]));

  process.stdout.write(
    `${JSON.stringify(
      {
        message: 'Demo data seeded successfully',
        users: {
          admin: admin.email,
          analyst: analyst.email,
          defaultViewer: fallbackViewer.email,
          viewer: viewer.email,
          viewer2: otherViewer.email,
        },
        recordsPerUser: {
          admin: recordCountMap.get(String(admin._id)) || 0,
          analyst: recordCountMap.get(String(analyst._id)) || 0,
          defaultViewer: recordCountMap.get(String(fallbackViewer._id)) || 0,
          viewer: recordCountMap.get(String(viewer._id)) || 0,
          viewer2: recordCountMap.get(String(otherViewer._id)) || 0,
        },
        seededRecords: totals,
      },
      null,
      2
    )}\n`
  );
};

run()
  .catch((error) => {
    process.stderr.write(`Seed failed: ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
