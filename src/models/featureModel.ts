import { Shopper } from "./shopperModel";
export interface Feature {
    intent: string;
    product: string;
    problemReported: string;
    resolution: string;
    outcome: string;
    context: string;
    troubleshootingSteps: string;
};