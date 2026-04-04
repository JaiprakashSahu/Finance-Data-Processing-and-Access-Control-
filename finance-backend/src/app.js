const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const { mockAuth } = require('./middleware/auth.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(mockAuth);

app.use('/users', userRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

module.exports = app;
