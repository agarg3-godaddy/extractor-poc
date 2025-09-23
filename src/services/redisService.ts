import Redis from 'ioredis';

export class RedisService {
  private static instance: RedisService;
  private redis: Redis;

  private constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    // Handle connection events
    this.redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.redis.on('close', () => {
      console.log('Redis connection closed');
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  // Cache operations
  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, value);
      } else {
        await this.redis.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // JSON operations
  async getJson<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET JSON error:', error);
      return null;
    }
  }

  async setJson(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value);
      return await this.set(key, jsonString, ttlSeconds);
    } catch (error) {
      console.error('Redis SET JSON error:', error);
      return false;
    }
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis PING error:', error);
      return false;
    }
  }
  async setHash(key: string, hash: Record<string, string>, ttl?: number): Promise<void> {
    await this.redis.hset(key, hash);
    if (ttl) {
      await this.redis.expire(key, ttl);
    }
  }
  
  async getHash(key: string): Promise<Record<string, string> | null> {
    const hash = await this.redis.hgetall(key);
    return Object.keys(hash).length > 0 ? hash : null;
  }
  
  async getHashField(key: string, field: string): Promise<string | null> {
    return await this.redis.hget(key, field);
  }

  // List operations for intent history
  async lpush(key: string, ...values: string[]): Promise<number> {
    return await this.redis.lpush(key, ...values);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.redis.lrange(key, start, stop);
  }

  async ltrim(key: string, start: number, stop: number): Promise<string> {
    return await this.redis.ltrim(key, start, stop);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.redis.expire(key, seconds);
  }
  // Close connection
  async disconnect(): Promise<void> {
    try {
      await this.redis.disconnect();
    } catch (error) {
      console.error('Redis disconnect error:', error);
    }
  }
}

// Export singleton instance
export const redisService = RedisService.getInstance();
export default redisService;
