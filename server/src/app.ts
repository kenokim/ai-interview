import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import http from 'http';
import { WebSocketServer } from 'ws';

import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import swaggerSpec from './swagger.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.GOOGLE_API_KEY) {
  console.error("❌ Error: GOOGLE_API_KEY is required in .env file");
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('🎙️ 클라이언트가 WebSocket으로 연결되었습니다.');

  ws.on('message', (message) => {
    console.log('받은 메시지: %s', message);
    ws.send('안녕하세요! 메시지를 잘 받았습니다.');
  });

  ws.on('close', () => {
    console.log('🔌 클라이언트와 WebSocket 연결이 끊겼습니다.');
  });

  ws.on('error', (error) => {
    console.error('WebSocket 오류 발생:', error);
  });
});


// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Security and logging middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/', routes);

// Error handling
app.use('*', notFoundHandler);
app.use(errorHandler);

export default server; 