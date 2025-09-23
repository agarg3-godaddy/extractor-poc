import { ExampleData } from "langextract";

export const prompts = {
    featureExtractionPromptUser: `Analyze this live conversation between a user and support agent, then extract the following information in JSON format:

EXTRACT THESE FIELDS:

1. INTENT - Match to ONE code:
   • AFTERMARKET: domain auction, cash parking, transaction-assured transfers
   • BILLING: subscriptions, renewals, cancellations, refunds, payment issues
   • CONSULT: sales/consultation, purchasing, upgrading, Airo inquiries
   • DNS: DNS updates, changes, troubleshooting
   • GD_PAYMENTS: GoDaddy Payments/Poynt support
   • GEM: Email Marketing/MadMimi support
   • HOSTING_CPANEL: cPanel hosting (not Website Builder)
   • HOSTING_MWP: Managed WordPress hosting
   • HOSTING_PLESK: Plesk/Windows hosting
   • HOSTING: general hosting (type unknown)
   • PREMDOM: premium domain inquiries/offers
   • PRODUCTIVITY: Email, Office 365, productivity products
   • SSL: SSL-related requests
   • WEBPRO: WebPro/Pro Hub issues
   • WEBSITES: Website Builder issues
   • WOOSAAS: Managed WooCommerce
   • GENERAL: unknown/doesn't fit categories

2. PRODUCT - Match to ALL that apply (comma-separated):
   domains, hosting, email_and_productivity, security, marketing, ecommerce, 
   web_professionals, website_services, business_tools, cross_cutting_technologies, 
   voice_and_communication, design_services, make_money, account_management

3. PROBLEM_REPORTED - User's main issue (1-2 sentences)

4. CONTEXT - Relevant background (account type, urgency, previous attempts - 2-3 sentences max)

5. RESOLUTION - Problem is solved or not, Boolean response


RETURN FORMAT:
{
  "intent": "[code or empty string]",
  "product": "[codes or empty string]",
  "problemReported": "[text or empty string]",
  "context": "[text or empty string]",
  "resolution": "[boolean or empty string]"
}

Rules:
- Return empty string "" for any field that's unclear or not present
- Intent: single code only
- Product: can be multiple, comma-separated
- Keep descriptions concise
- Return ONLY the JSON, no explanations`,
  featureExtractionPromptAgent: `Extract technical actions from the support agent's responses.

Find:
1. RESOLUTION: The fix or solution provided (1 sentence)
2. TROUBLESHOOTING_STEPS: Numbered list of actions taken

Return JSON:
{
  "resolution": "[solution or empty]",
  "troubleshootingSteps": "[numbered list or empty]"
}

Ignore greetings and explanations. Focus only on technical actions and fixes.`,
   agentPrompt: `CONTEXT FROM PREVIOUS INTERACTIONS:
    {
      "intent": "{intent}",
      "product": "{product}",
      "problemReported": "{problemReported}",
      "previousResolutions": "{previousResolutions}",
      "outcome": "{outcome}",
      "context": "{context}",
      "previousTroubleshootingSteps": "{previousTroubleshootingSteps}"
    }

    CURRENT USER MESSAGE:
    {user_message}

    ---

    You are a technical support agent. Based on the user's history above and their current message:

    1. Acknowledge any previous issues if relevant
    2. Avoid repeating failed troubleshooting steps from history
    3. Provide appropriate next-level support or alternative solutions
    4. If previous outcome was UNRESOLVED/PENDING, continue from where last interaction ended

    Respond naturally and helpfully to resolve their issue.`,
};

export const examples: ExampleData[] = [
    {
      text: "thanks",
      extractions: [
        {
          extractionClass: "conversation_features",
          extractionText: "",
          attributes: {
            intent: "",
            context: "",
            product: "",
            summary: "",
            customer_wants: "",
            sentiment: ""
          },
        },
      ],
    },
  ];