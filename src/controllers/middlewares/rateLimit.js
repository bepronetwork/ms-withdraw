import rateLimit from 'express-rate-limit';
import { LIMIT, RATE } from '../../config';

const rateLimiterUsingThirdParty = rateLimit({
  windowMs: LIMIT * 60 * 1000,
  max: RATE,
  message: `You have exceeded the ${RATE} requests in ${LIMIT} min limit!`,
  headers: true,
});

export default rateLimiterUsingThirdParty;