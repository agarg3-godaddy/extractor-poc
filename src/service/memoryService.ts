import { randomUUID } from 'crypto';
// import MemoryClient from 'mem0ai';
import { Memory } from 'mem0ai/oss';
import { PgApi } from '../interface/api/pg-api';
import { redisService } from '../services/redisService';
import { CAASApi } from '../interface/api/caas-api';
export const MemoryService = {
  async createSession(shopperId: string, req: any): Promise<string> {
    const ucid = randomUUID();
    const shopper = await this.getShopperDetails(shopperId, ucid,req);
    const ucid_cached_key = `${shopperId}:${ucid}`;
    await redisService.setJson(ucid_cached_key, shopper, 3000);
    return ucid;
  },

  async sendMessage(prompt: string, text: string, req: any): Promise<any> {

    const caasApi = new CAASApi();
    const output = await caasApi.sendMessage(req,prompt, text);
    return output;
  },

  async getShopperDetails(shopperId: string, ucid: string, req: any): Promise<any> {
    // Check Redis cache first
    const cacheKey = `shopper:${shopperId}}`;
    const cachedShopper = await redisService.getJson(cacheKey);
    
    if (cachedShopper) {
      return cachedShopper;
    }
    const pgApi = new PgApi();
    const shopper = await pgApi.getShopper(shopperId, req);
    await redisService.setJson(cacheKey, shopper, 3000);
    return shopper;
  },

  async checkRedisHealth(): Promise<boolean> {
    return await redisService.ping();
  }
}