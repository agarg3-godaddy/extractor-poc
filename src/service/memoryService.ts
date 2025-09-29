import { randomUUID } from 'crypto';
// import MemoryClient from 'mem0ai';
import { Memory } from 'mem0ai/oss';
import { PgApi } from '../interface/api/pg-api';
import { Agent } from '../interface/api/agent';
import { redisService } from '../services/redisService';
import { CAASApi } from '../interface/api/caas-api';
import { prompts } from '../constants/prompts';
import { Feature } from '../models/featureModel';

/**
 * Utility function to safely convert CAAS API response to Feature object
 */
const convertToFeature = (response: string, fallbackText: string): Feature => {
  try {
    // Clean and extract JSON from response
    const cleanedResponse = response.trim();
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : cleanedResponse;
    
    const parsed = JSON.parse(jsonString);
    
    // Create Feature object with type safety
    return {
      intent: String(parsed.intent || ''),
      product: String(parsed.product || ''),
      problemReported: String(parsed.problemReported || ''),
      context: String(parsed.context || ''),
      resolution: String(parsed.resolution || ''),
      outcome: String(parsed.outcome || ''),
      troubleshootingSteps: String(parsed.troubleshootingSteps || '')
    };
  } catch (error) {
    console.error('Failed to convert CAAS response to Feature:', error);
    console.error('Response:', response);
    
    // Return fallback feature
    return {
      intent: '',
      product: '',
      problemReported: fallbackText,
      context: fallbackText,
      resolution: '',
      outcome: '',
      troubleshootingSteps: ''
    };
  }
};
export const MemoryService = {
  async createSession(shopperId: string, req: any): Promise<string> {
    const ucid = randomUUID();
    const shopper = await this.getShopperDetails(shopperId, ucid,req);
    const ucid_cached_key = `${shopperId}:${ucid}`;
    await redisService.setJson(ucid_cached_key, shopper, 3000);
    return ucid;
  },

  async sendMessage(prompt: string, text: string, req: any): Promise<string> {
    try {
      /*
      const getHistory= await redisService.getHash(`feature:test_1`);
      let agentPrompt = prompts.agentPrompt;
      agentPrompt = agentPrompt.replace('{user_message}', text);
      if(getHistory){
        agentPrompt = agentPrompt.replace('{intent}', getHistory?.intent || '').replace('{product}', getHistory?.product || '').replace('{problemReported}', getHistory?.problemReported || '').replace('{previousResolutions}', getHistory?.previousResolutions || '').replace('{outcome}', getHistory?.outcome || '').replace('{context}', getHistory?.context || '').replace('{previousTroubleshootingSteps}', getHistory?.previousTroubleshootingSteps || '');
      } 
      const agent = new Agent();
      const output = await agent.sendMessageToGDAgent(agentPrompt);
      */
      const output = await this.extractFeatures('user', text, req);
      //await this.extractFeatures('agent', output, req);
      
      return output;
    } catch (error) {
      console.error('Error calling CAAS API:', error);
      
      // Fallback: create a basic feature with the original text
      return 'Error: ' + error;
    }
  },

  async extractFeatures(sender: string, text: string, req: any) {
    const caasApi = new CAASApi();
    const prompt = sender === 'user' ? prompts.featureExtractionPromptUser : prompts.featureExtractionPromptAgent;
    const output = await caasApi.sendMessage(req, prompt, text);
    console.log('output', output);
    
    try {
      // Parse the JSON response
      const jsonResponse = JSON.parse(output);
      
      // Store the parsed JSON as hash in Redis - simple overwrite
      await this.storeFeatureJsonAsHash('test_1', jsonResponse, sender, text);
      
      return jsonResponse;
    } catch (error) {
      console.error('Error parsing or storing feature JSON:', error);
      return output; // Return raw output if parsing fails
    }
  },

  /**
   * Stores feature extraction JSON response as Redis hash - fact_name:json structure
   */
  async storeFeatureJsonAsHash(sessionId: string, jsonResponse: any, sender: string, userMessage?: string) {
    const hashKey = `feature:${sessionId}`;
    
    try {
      // Build hash object with fact_name:json structure
      const hashData: Record<string, string> = {};
      
      // Handle different JSON response structures
      if (jsonResponse.facts && Array.isArray(jsonResponse.facts)) {
        // New structure: { "facts": [{"INTENT": {"factName": "INTENT", "factValue": "EMAIL_STORAGE", "confidence": 0.95}}] }
        for (const factObj of jsonResponse.facts) {
          // Each factObj is like: {"INTENT": {"factName": "INTENT", "factValue": "EMAIL_STORAGE", "confidence": 0.95}}
          for (const [factKey, factData] of Object.entries(factObj)) {
            if (factData && typeof factData === 'object' && 'factValue' in factData) {
              const factId = factKey.toLowerCase();
              const factValue = String((factData as any).factValue || '');
              const confidence = (factData as any).confidence || 0;
              const currentTime = Date.now();
              
              // Create fact object in the required format
              const factObject = {
                fact_id: factId,
                value: factValue,
                confidence: confidence,
                updated_at: currentTime,
                text: userMessage || '',
                source: sender,
                actor: `${sender}::${sessionId}`
              };
              
              // Store as JSON string in hash
              hashData[factId] = JSON.stringify(factObject);
            }
          }
        }
      } else if (typeof jsonResponse === 'object') {
        // Direct object structure: { "intent": "BILLING", "product": "domains" }
        for (const [key, value] of Object.entries(jsonResponse)) {
          if (typeof value === 'string') {
            const factId = key.toLowerCase();
            const currentTime = Date.now();
            
            // Create fact object in the required format
            const factObject = {
              fact_id: factId,
              value: value,
              confidence: 1.0,
              updated_at: currentTime,
              text: userMessage || '',
              source: sender,
              actor: `${sender}::${sessionId}`
            };
            
            // Store as JSON string in hash
            hashData[factId] = JSON.stringify(factObject);
          }
        }
      }
      
      // Add session metadata
      hashData.lastUpdatedBy = sender;
      hashData.lastUpdatedAt = new Date().toISOString();
      
      // Overwrite the entire hash
      await redisService.setHash(hashKey, hashData, 36000);
      console.log(`Feature JSON stored as hash for session ${sessionId} by ${sender}:`, Object.keys(hashData));
      
    } catch (error) {
      console.error('Error storing feature JSON as hash:', error);
      throw error;
    }
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