import cors from 'cors';
import { env } from '../../config/env';

const corsOptions = {
  origin: env.NODE_ENV === 'development' 
    ? true // Allow all origins in development
    : env.FRONTEND_URL, // Restrict to specific origin in production
  credentials: true,
  optionsSuccessStatus: 200,
};

export default cors(corsOptions);

