// Minimal test server for Railway debugging
const express = require('express');
const app = express();

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Basic routes
app.get('/', (req, res) => {
  console.log('Root route hit');
  res.json({
    message: 'OpsPilot Test Server',
    timestamp: new Date().toISOString(),
    port: PORT,
    host: HOST
  });
});

app.get('/health', (req, res) => {
  console.log('Health check hit');
  res.json({ status: 'ok' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Server error' });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Test server running on ${HOST}:${PORT}`);
  console.log(`✅ Ready for Railway`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  process.exit(0);
});