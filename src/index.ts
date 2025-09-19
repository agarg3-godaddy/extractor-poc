import express, { Application } from 'express';
import { MemoryController } from './controller/controller';
import dotenv from 'dotenv';
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize controller
const basicController = new MemoryController();

// Routes
app.get('/api/data', basicController.getData);
app.post('/api/data', basicController.createSessiom);
app.post('/api/message', basicController.sendMessage);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`GET endpoint: http://localhost:${PORT}/api/data`);
  console.log(`POST endpoint: http://localhost:${PORT}/api/data`);
});

export default app;
