const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const { mockAuth } = require('./middleware/auth.middleware');
const { sendSuccess } = require('./utils/response');

const app = express();

app.use(cors());
app.use(express.json());
app.use(mockAuth);

app.use('/users', userRoutes);

app.get('/health', (req, res) => {
  return sendSuccess(res, 200, 'Server is running', {
    status: 'ok',
  });
});

module.exports = app;
