import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

// Middlewares
import { protectedRoute } from './middlewares/protectedMiddleware';
import { errorHandler, notFound } from './middlewares/errorMiddlewares';

// Routes
import api from './routes';

// Utils
require('dotenv').config();

// App
const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
// Before API Route
app.use(protectedRoute);

// API Routes
app.use('/api/v1', api);

// After API Route
app.use(notFound);
app.use(errorHandler);

export default app;
