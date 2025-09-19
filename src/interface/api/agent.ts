import { GDAgent, getMcpUrl } from "@godaddy/agent-sdk";
import { run } from '@openai/agents';
import { Feature } from '../../models/featureModel';


export class Agent{
    public async sendMessageToGDAgent(message: string, prompt: string): Promise<string>{
        try {

        const goKnowbUrl = getMcpUrl('goknowb');
        console.log(`🔗 Using: ${goKnowbUrl}\n`);
        return goKnowbUrl;
        /*
          const agent = new GDAgent({
            name: 'GD Agent',
            instructions: prompt,
          });
          const result = await run(agent as any, message);
          return result.finalOutput as string;*/
        } catch (error) {
            console.error("Error calling OpenAI:", error);
            return "Error: " + (error as Error).message;
        }
    }
    public async ExtractFeatures(message: string, prompt: string): Promise<Feature>{
        try {
            const agent = new GDAgent({
                name: 'Extract Features',
                instructions: prompt,
            });
            const result = await run(agent as any, message);
            const jsonString = result.finalOutput;
            
            // Parse the JSON string to Feature object
            try {
                const parsedFeature = JSON.parse(jsonString);
                return parsedFeature as Feature;
            } catch (parseError) {
                console.error('Failed to parse agent response:', parseError);
                console.error('Raw response:', jsonString);
                throw new Error(`Failed to parse agent response: ${parseError}`);
            }
        }
        catch (error) {
            console.error("Error calling OpenAI:", error);
            throw error;
        }
    }
}