import { GDAgent } from '@godaddy/agent-sdk';
import { run } from '@openai/agents';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log("API Key:", process.env.OPENAI_API_KEY ? "Set (length: " + process.env.OPENAI_API_KEY.length + ")" : "Not set");
  console.log("Base URL:", process.env.OPENAI_BASE_URL || "Not set");
  console.log("GD_ENV:", process.env.GD_ENV || "Not set");
  
  const agent = new GDAgent({
    name: 'History Tutor',
    instructions:
      'You provide assistance with historical queries. Explain important events and context clearly.',
  });
  
  try {
    const result = await run(agent, 'When did sharks first appear?');
    console.log(result.finalOutput);
  } catch (error) {
    console.error("Error running agent:", error);
  }
}

main().catch(console.error);