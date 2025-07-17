import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

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

export default app; 