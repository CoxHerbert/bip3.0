import 'dotenv/config';
import express from 'express';
import { connectToDatabase } from './config/database.js';
import noteRoutes from './routes/noteRoutes.js';

const app = express();

app.use(express.json());

const DISALLOWED_CONTENT_TYPES = ['multipart/form-data', 'application/octet-stream'];

app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (
      contentType &&
      DISALLOWED_CONTENT_TYPES.some((type) => contentType.toLowerCase().includes(type))
    ) {
      return res.status(415).json({ message: 'File uploads are not supported.' });
    }
  }
  next();
});
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/notes', noteRoutes);

app.use((err, req, res, _next) => {
  console.error(err);
  const status = err.status ?? 500;
  res.status(status).json({
    message: err.message ?? 'Internal Server Error'
  });
});

const PORT = Number.parseInt(process.env.PORT ?? '4000', 10);

async function start() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`API server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exitCode = 1;
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

export default app;