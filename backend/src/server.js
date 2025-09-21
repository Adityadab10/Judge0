const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const codeRoutes = require('./routes/code.routes');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000','http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api', codeRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

