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
   
      const getHistory= await redisService.getHash(`feature:test_1`);
      let agentPrompt = prompts.agentPrompt;
      agentPrompt = agentPrompt.replace('{user_message}', text);
      if(getHistory){
        agentPrompt = agentPrompt.replace('{intent}', getHistory?.intent || '').replace('{product}', getHistory?.product || '').replace('{problemReported}', getHistory?.problemReported || '').replace('{previousResolutions}', getHistory?.previousResolutions || '').replace('{outcome}', getHistory?.outcome || '').replace('{context}', getHistory?.context || '').replace('{previousTroubleshootingSteps}', getHistory?.previousTroubleshootingSteps || '');
      } 
      const agent = new Agent();
      const output = await agent.sendMessageToGDAgent(agentPrompt);
      await this.extractFeatures('user', text, req);
      await this.extractFeatures('agent', output, req);
      
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

    const response = convertToFeature(output, text);
    
    // Direct hash update - no need to get current values
    await this.updateFeatureHash('test_1', response, sender);
  },

  /**
   * Updates feature hash selectively - only updates fields with actual values
   * Keeps existing values for empty fields
   */
  async updateFeatureHash(sessionId: string, feature: Feature, sender: string) {
    const hashKey = `feature:${sessionId}`;
    
    try {
      // Get existing hash to preserve non-empty values
      const existingHash = await redisService.getHash(hashKey) || {};
      
      // Build update object with only non-empty values
      const fieldsToUpdate: Record<string, string> = {};
      
      // Only update fields that have actual values (not empty strings)
      if (feature.intent && feature.intent.trim() !== '') {
        fieldsToUpdate.intent = feature.intent;
      }
      if (feature.product && feature.product.trim() !== '') {
        fieldsToUpdate.product = feature.product;
      }
      if (feature.problemReported && feature.problemReported.trim() !== '') {
        fieldsToUpdate.problemReported = feature.problemReported;
      }
      if (feature.context && feature.context.trim() !== '') {
        fieldsToUpdate.context = feature.context;
      }
      if (feature.resolution && feature.resolution.trim() !== '') {
        fieldsToUpdate.resolution = feature.resolution;
      }
      if (feature.outcome && feature.outcome.trim() !== '') {
        fieldsToUpdate.outcome = feature.outcome;
      }
      if (feature.troubleshootingSteps && feature.troubleshootingSteps.trim() !== '') {
        fieldsToUpdate.troubleshootingSteps = feature.troubleshootingSteps;
      }
      
      // Always update metadata
      fieldsToUpdate.lastUpdatedBy = sender;
      fieldsToUpdate.lastUpdatedAt = new Date().toISOString();
      
      // Only update if there are fields to update (excluding metadata)
      const hasUpdates = Object.keys(fieldsToUpdate).some(key => 
        key !== 'lastUpdatedBy' && key !== 'lastUpdatedAt'
      );
      
      if (hasUpdates) {
        await redisService.setHash(hashKey, fieldsToUpdate, 36000);
        console.log(`Feature hash updated for session ${sessionId} by ${sender}:`, Object.keys(fieldsToUpdate));
      } else {
        // Only update metadata if no other fields changed
        await redisService.setHash(hashKey, {
          lastUpdatedBy: sender,
          lastUpdatedAt: new Date().toISOString()
        }, 36000);
        console.log(`Only metadata updated for session ${sessionId} by ${sender}`);
      }

      // Handle intent history as separate list (only if intent has value)
      if (feature.intent && feature.intent.trim() !== '') {
        await this.updateIntentHistory(sessionId, feature.intent, sender);
      }

    } catch (error) {
      console.error('Error updating feature hash:', error);
      throw error;
    }
  },

  /**
   * Alternative method for selective updates using individual field updates
   * More efficient for single field updates
   */
  async updateFeatureField(sessionId: string, field: keyof Feature, value: string, sender: string) {
    const hashKey = `feature:${sessionId}`;
    
    // Only update if value is not empty
    if (value && value.trim() !== '') {
      try {
        // Update individual field
        await redisService.setHash(hashKey, {
          [field]: value,
          lastUpdatedBy: sender,
          lastUpdatedAt: new Date().toISOString()
        }, 36000);
        
        console.log(`Field ${field} updated for session ${sessionId} by ${sender}`);
        
        // Handle intent history if updating intent field
        if (field === 'intent') {
          await this.updateIntentHistory(sessionId, value, sender);
        }
      } catch (error) {
        console.error(`Error updating field ${field}:`, error);
        throw error;
      }
    } else {
      console.log(`Skipping empty field ${field} for session ${sessionId}`);
    }
  },

  /**
   * Updates intent history as a separate Redis list
   */
  async updateIntentHistory(sessionId: string, intent: string, sender: string) {
    const intentListKey = `intent_history:${sessionId}`;
    
    try {
      // Add new intent with timestamp and sender info
      const intentEntry = JSON.stringify({
        intent,
        sender,
        timestamp: new Date().toISOString()
      });
      
      // Add to list (most recent first)
      await redisService.lpush(intentListKey, intentEntry);
      
      // Keep only last 20 intents to prevent memory bloat
      await redisService.ltrim(intentListKey, 0, 19);
      
      // Set TTL for intent history
      await redisService.expire(intentListKey, 36000);
      
      console.log(`Intent history updated: ${intent} by ${sender}`);
    } catch (error) {
      console.error('Error updating intent history:', error);
      // Don't throw - this is supplementary data
    }
  },

  /**
   * Gets intent history for a session
   */
  async getIntentHistory(sessionId: string): Promise<any[]> {
    const intentListKey = `intent_history:${sessionId}`;
    
    try {
      const intentEntries = await redisService.lrange(intentListKey, 0, -1);
      return intentEntries.map(entry => JSON.parse(entry));
    } catch (error) {
      console.error('Error getting intent history:', error);
      return [];
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