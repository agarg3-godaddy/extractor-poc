import { Shopper } from "./shopperModel";
export interface Feature {
    intent: string;
    context: string;
    product: string;
    summary: string;
    customer_wants: string;
    sentiment: string;
    customerInfo?: Shopper;
}