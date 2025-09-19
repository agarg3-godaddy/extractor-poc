import { randomUUID } from 'crypto';
// import MemoryClient from 'mem0ai';
import { Memory } from 'mem0ai/oss';
import { PgApi } from '../interface/api/pg-api';
import { redisService } from '../services/redisService';
import { Agent } from '../interface/api/agent';
import { prompts } from '../constants/prompts';
import { Feature } from '../models/featureModel';
import { extract, ExampleData } from "langextract";
import { examples } from '../constants/prompts';
import { GuardrailsEngine, piiGuard, SelectionType } from '@presidio-dev/hai-guardrails';
import { ClientOptions, generateClient, startClient } from '@switchboard/client';

  const options: ClientOptions = {
    callingService: 'careai-prompt-dev',
    env: 'development',
    auth: {
      primaryRegion: 'us-west-2',
      secondaryRegion: 'us-east-1',
    },
    dataRetrieval: {
      'default|my_app': {}
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
  async sendMessage(ucid: string, message: string, shopperId: string) {
    const client = generateClient(options);
    await client.start();
    const metadata = await client.getValues(
        [
          {
            application: "default|careai-prompt-dev",
            setting: "careai-prompt-dev",
            defaultValue: {}
          }
        ]
      );
    console.log('metadata :>> ', metadata);
//   const check = await createClient(options)
  console.log(metadata);
    /*
    const guard = piiGuard({
        selection: SelectionType.All,
    })

    const messages = [
        {
            role: 'user',
            content: message,
        },
    ]
    const engine = new GuardrailsEngine({
        guards: [piiGuard({ selection: SelectionType.All })],
    })
    const resultsEngine = await engine.run(messages)
    // Access sanitized messages
    const cleanMessages = resultsEngine.messages
    console.log("Clean messages: ", cleanMessages);

    const results = await guard(messages);
    if (results && results[0] && results[0].modifiedMessage && results[0].modifiedMessage.content) {
      console.log(results[0].modifiedMessage.content);
      return results[0].modifiedMessage.content;
    } else {
      console.log("No modified message content found.");
    }
    /*
    const result = await extract(message, {
        promptDescription: prompts.featureExtractionPrompt,
        modelType: "openai",
        examples: examples,
        baseURL: "https://caas-gocode-prod.caas-prod.prod.onkatana.net",
        apiKey: "",
        modelId: "gpt-4",
      });
    
     console.log(result);
    return "test";
    const cacheKey = `${shopperId}:${ucid}`;
    const customerDetails = await redisService.getJson(cacheKey);    
    const customerDetailsString = JSON.stringify(customerDetails);
    const completePrompt = `${prompts.featureExtractionPrompt}}`;
    const agent = new Agent();
    const feature: Feature = await agent.ExtractFeatures( message, completePrompt);
    *
    if(feature ){
        
        const featureWithShopper = {
            ...feature,
            customerInfo: customerDetails
        };
        await redisService.setJson(`${cacheKey}`, featureWithShopper, 3000);*/
        const agent = new Agent();
        //const response = await agent.sendMessageToGDAgent( message, "completePrompt");
        
        return "ok";
        /*
    }
    else
    {
        return customerDetailsString;
    }
   
    return feature;*/
  },
  async createMemory() {
    const config = {
        llm: {
          provider: 'openai' as const,
          config: {
            apiKey: '',
            model: 'gpt-4o-mini', // Using a valid model name
            temperature: 0.2,
            maxTokens: 1500,
            // Use baseURL for TypeScript SDK
            baseURL: "https://caas-gocode-prod.caas-prod.prod.onkatana.net"
          },
        },
        embedder: {
          provider: 'openai' as const,
          config: {
            apiKey: '',
            model: 'text-embedding-3-small',
            baseURL: "https://caas-gocode-prod.caas-prod.prod.onkatana.net"
          },
        },
        vectorStore: {
          provider: 'memory' as const,
          config: {
            collectionName: 'sample-memories',
          },
        },
      };

      
      const memory = new Memory(config);
      const messages = [
        {"role": "user", "content": "I'm planning to watch a movie tonight. Any recommendations?"},
        {"role": "assistant", "content": "How about a thriller movies? They can be quite engaging."},
        {"role": "user", "content": "I'm not a big fan of thriller movies but I love sci-fi movies."},
        {"role": "assistant", "content": "Got it! I'll avoid thriller recommendations and suggest sci-fi movies in the future."}
    ]
    
    await memory.add(messages, { userId: "alice", metadata: { category: "movie_recommendations" } });
  },

  async checkRedisHealth(): Promise<boolean> {
    return await redisService.ping();
  }
}