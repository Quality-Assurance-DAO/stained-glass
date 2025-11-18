import cors from 'cors';
import { env } from '../../config/env';

const corsOptions = {
  origin: env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
};

export default cors(corsOptions);

