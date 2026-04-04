const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const recordRoutes = require('./routes/record.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const { mockAuth } = require('./middleware/auth.middleware');
const { sendSuccess } = require('./utils/response');

const app = express();

app.use(cors());
app.use(express.json());
app.use(mockAuth);

app.use('/users', userRoutes);
app.use('/records', recordRoutes);
app.use('/dashboard', dashboardRoutes);

app.get('/health', (req, res) => {
  return sendSuccess(res, 200, 'Server is running', {
    status: 'ok',
  });
});

module.exports = app;

