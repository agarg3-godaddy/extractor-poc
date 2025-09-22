import axios from 'axios';
import { HelperUtils } from '../../utils/helperUtil';

// Interface for the prompt structure
interface Prompt {
  from: 'system' | 'user';
  content: string;
}

// Interface for the request payload
interface CAASRequest {
  prompts: Prompt[];
  provider: string;
  providerOptions: {
    model: string;
  };
}

// Interface for the CAAS API response structure
interface CAASResponse {
  data: {
    id: string;
    author: string;
    cost: number;
    effort: string;
    projectId: string;
    isPrivate: boolean;
    isTemplate: boolean;
    flagged: boolean;
    privacyFlagged: boolean;
    privacyMode: string;
    preview: string;
    promptId: string;
    promptPreview: string;
    provider: string;
    source: string;
    type: string;
    originalFormat: string;
    voteCount: number;
    voteTotal: number;
    retries: number;
    status: string;
    createDate: number;
    datePartition: string;
    moderate: boolean;
    moderatePrompt: boolean;
    moderateTemplate: boolean;
    moderateProvider: string;
    protected: string;
    s3Url: string;
    prompts: Prompt[];
    props: Record<string, any>;
    providerOptions: {
      model: string;
      provider: string;
      moderateProvider: string;
      moderatePrompt: boolean;
      moderateTemplate: boolean;
      max_tokens: number;
      temperature: number;
      top_p: number;
      frequency_penalty: number;
      presence_penalty: number;
      messages: Array<{
        role: string;
        content: string;
      }>;
    };
    privacy: {
      mode: string;
      threshold: number;
    };
    resolvedPrompts: Prompt[];
    resultOptions: {
      costs: {
        items: Array<{
          service: string;
          amount: number;
        }>;
      };
      privacy: {
        flagged: boolean;
        entities: any[];
      };
      promptModeration: any;
      id: string;
      object: string;
      created: number;
      model: string;
      usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        prompt_tokens_details: any;
        completion_tokens_details: any;
      };
      service_tier: string;
      system_fingerprint: any;
      index: number;
      logprobs: any;
      finish_reason: string;
      moderation: any;
    };
    value: {
      from: string;
      content: string;
    };
    metadata: Record<string, any>;
    groups: any[];
    format: string;
  };
  status: number;
}

export class CAASApi {
  private readonly baseURL: string;
  private readonly timeout: number;

  constructor(baseURL: string = 'https://caas.api.dev-godaddy.com/v1', timeout: number = 30000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  /**
   * Makes a call to the CAAS API with the specified prompts and provider options
   * @param promptInput - The system prompt content
   * @param inputText - The user input text
   * @param provider - The provider name (e.g., 'openai', 'anthropic', etc.)
   * @param model - The model name (e.g., 'gpt-4', 'claude-3', etc.)
   * @returns Promise<CAASResponse> - The API response
   */
  public async callCAAS(
    req: any,
    promptInput: string,
    inputText: string,
  ): Promise<CAASResponse> {
    try {
      const cookieHeader = HelperUtils.buildJomaxCookieHeaderValue(req);
      const requestPayload: CAASRequest = {
        prompts: [
          {
            from: 'system',
            content: promptInput
          },
          {
            from: 'user',
            content: inputText
          }
        ],
        provider: process.env.CAAS_PROVIDER || 'openai_chat',
        providerOptions: {
          model: process.env.CAAS_MODEL || 'gpt-3.5-turbo'
        }
      };

     // console.log('Making CAAS API call with payload:', JSON.stringify(requestPayload, null, 2));

      const response = await axios.post<CAASResponse>(
        `${this.baseURL}/prompts`,
        requestPayload,
        {
          headers: cookieHeader,
          timeout: this.timeout,
        }
      );

     // console.log('CAAS API response status:', response.status);
     // console.log('CAAS API response data:', JSON.stringify(response.data, null, 2));

      return response.data;
    } catch (error: any) {
      console.error('Error calling CAAS API:', error);
      
      throw new Error(`CAAS API Error: ${error.message}`);
    }
  }

  /**
   * Convenience method for common use cases that returns just the content
   * @param systemPrompt - The system prompt
   * @param userMessage - The user message
   * @param provider - The provider (defaults to 'openai')
   * @param model - The model (defaults to 'gpt-4')
   * @returns Promise<string> - Just the content from the response
   */
  public async sendMessage(
    req: any,
    systemPrompt: string,
    userMessage: string,
  ): Promise<any> {
    const response = await this.callCAAS(req,systemPrompt, userMessage);
    return response.data.value.content;
  }

  /**
   * Get just the content from a CAAS response
   * @param response - The CAAS API response
   * @returns string - The content from the response
   */
  public getContent(response: CAASResponse): string {
    return response.data.value.content;
  }
}

// Export a default instance for convenience
export const caasApi = new CAASApi();

// Export the class for custom instances
export default CAASApi;
