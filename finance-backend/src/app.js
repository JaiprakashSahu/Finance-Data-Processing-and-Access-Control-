const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const recordRoutes = require('./routes/record.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const { sendSuccess } = require('./utils/response');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/records', recordRoutes);
app.use('/dashboard', dashboardRoutes);

app.get('/health', (req, res) => {
  return sendSuccess(res, 200, 'Server is running', {
    status: 'ok',
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

