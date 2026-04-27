// ============================================================
// Redis Configuration — Optional caching layer
// ============================================================

const Redis = require('ioredis');
require('dotenv').config();

let redisClient = null;
let isRedisAvailable = false;

/**
 * Initialize Redis client with graceful fallback.
 * If Redis is unavailable, the app continues without caching.
 */
function initRedis() {
  try {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('[Redis] Max retries reached. Running without cache.');
          return null; // Stop retrying
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      isRedisAvailable = true;
      console.log('[Redis] Connected successfully');
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      console.warn('[Redis] Connection error:', err.message);
    });

    redisClient.on('close', () => {
      isRedisAvailable = false;
    });

    // Attempt connection
    redisClient.connect().catch(() => {
      console.warn('[Redis] Could not connect. Running without cache.');
    });
  } catch (err) {
    console.warn('[Redis] Init failed:', err.message);
  }
}

/**
 * Get cached value by key.
 * @param {string} key
 * @returns {Promise<string|null>}
 */
async function getCache(key) {
  if (!isRedisAvailable || !redisClient) return null;
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

/**
 * Set cached value with TTL.
 * @param {string} key
 * @param {*} value
 * @param {number} ttlSeconds - Time-to-live in seconds (default 60)
 */
async function setCache(key, value, ttlSeconds = 60) {
  if (!isRedisAvailable || !redisClient) return;
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // Silently fail — caching is optional
  }
}

/**
 * Invalidate cache by key pattern.
 * @param {string} pattern - Redis key pattern (e.g., 'live:*')
 */
async function invalidateCache(pattern) {
  if (!isRedisAvailable || !redisClient) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch {
    // Silently fail
  }
}

module.exports = {
  initRedis,
  getCache,
  setCache,
  invalidateCache,
  getRedisClient: () => redisClient,
  isRedisConnected: () => isRedisAvailable,
};
