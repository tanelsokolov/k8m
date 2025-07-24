import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 5173;

// Proxy /api/metrics to backend metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    const backendUrl = process.env.BACKEND_URL;
    const response = await axios.get(`${backendUrl}/metrics`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching metrics:', error.message);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Serve static files
app.use(express.static(__dirname));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Docker healthcheck
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dashboard server running on port ${PORT}`);
});
