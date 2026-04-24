import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => console.error('prize-service redis error:', err.message));
redis.on('connect', () => console.log('prize-service: Connected to Redis'));

export default redis;
