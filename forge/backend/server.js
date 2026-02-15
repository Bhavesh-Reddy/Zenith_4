const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forge';

console.log('🔄 Connecting to MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected!');
    console.log('📊 Database:', mongoose.connection.name);
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
  });

const pagesRouter = require('./routes/pages');
app.use('/api/pages', pagesRouter);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Forge API running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log('🔥 ================================');
  console.log(`🚀 FORGE API: http://localhost:${PORT}`);
  console.log('🔥 ================================');
});