// Define types for Query and Mutation
type QueryType = {
    [key: string]: string;
};

type MutationType = {
    [key: string]: string;
};

const Query: QueryType = {

    // Product Graph API Queries
    shopper: `
        query Shopper($shopperId: String!) {
            shopper(shopperId: $shopperId) {
                contact {
                    address {
                        country
                    }
                    
                }
                createdAt
                customerId
                customerType
                locale
                spendTotal13MonthUSD
                updatedAt
                subscriptions {
                    domain
                    status
                    productName
                    commonName
                    autoRenew
                    offerPlan
                    paidThroughDate
                    canBeRenewed
                }
                

           }
        }
    `,
    // UIP API Queries
    userV2: `
        query UserV2($identifier: UserIdentifier!) {
            userV2(identifier: $identifier) {
                brand(brand: "godaddy") {
                    namespace(namespace: "experimental") {
                        insightName(insight: "next_best_product_recommendation_map")
                        insightValue
                    }
                }
            }
        }
    `,
};

const Mutation: MutationType = {
};

export { Query, Mutation };
export type { QueryType, MutationType };
