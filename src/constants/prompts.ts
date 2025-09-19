import { ExampleData } from "langextract";

export const prompts = {
    featureExtractionPrompt: `Extract the following from the conversation. Ignore greetings (hi, hello, thanks, bye). Return null if no meaningful content found.
        EXTRACT:
        1. intent: What is the customer trying to do? (e.g., "purchase", "cancel", "get_refund", "technical_support", "check_status")
        2. context: What is the background/situation?
        3. product: What product/service is being discussed?
        4. sentiment: Customer emotion ("positive", "negative", "neutral", "frustrated", "angry", "happy")
        RETURN FORMAT:
        {
        "intent": "value or null",
        "context": "value or null",
        "product": "value or null",
        "sentiment": "value or null"
        }

        If the conversation only contains greetings or no meaningful information, return empty response no value.`,


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