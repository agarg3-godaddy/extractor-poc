import BaseClient from '@gdcorp-digitalcare/common-api/dist/BaseClient';
import { Shopper } from '../../models/shopperModel';
import { Query } from '../../constants/queryConstants';
import { HelperUtils } from '../../utils/helperUtil';

export class PgApi extends BaseClient {
  constructor() {
    super({
      baseURL: process.env.PG_API_BASE_URL || 'https://pg.api.godaddy.com/v1/gql'
    });
  }

  private buildHeaders(req: any): Record<string, string> {
    const cookieHeader = HelperUtils.buildJomaxCookieHeaderValue(req);
    return {
      ...cookieHeader,
      'Content-Type': 'application/json',
      'X-App-Key': process.env.X_APP_KEY || 'care-agent'
    };
  }

  public async getShopper(shopperId: string, req: any): Promise<Shopper> {
    if (!shopperId) {
      throw new Error('shopperId is required');
    }
    try {
      return (await this.execute<{ data: { shopper: Shopper } }>({
        url: `/admin`,
        method: 'POST',
        headers: this.buildHeaders(req),
        data: {
          query: Query.shopper,
          operationName: "Shopper",
          variables: {
            shopperId: shopperId
          }
        }
      })).data.shopper;
    } catch (e) {
      console.error('Error in getData from PG API for shopperId', { shopperId, error: e });
      throw e;
    }
  }

}

export default PgApi;