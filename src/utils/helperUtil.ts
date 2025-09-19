//  Helper functions
import jwt from 'jsonwebtoken';

export namespace HelperUtils 
{

    export function extractCookieValues(req?: any): [string, string][] {
        // Assuming req.headers.cookie contains the cookies as a string
        const cookieString: string = req?.headers?.cookie || '';
        return cookieString.split(';').map((cookie: string): [string, string] => {
            const [key, value] = cookie.split('=').map((part: string) => part.trim());
            return [key, value];
        });
    }
    // Function to extract cookie from the cookie array
    export function extractCookieByName(cookieArray: [string, string][], keyToExtract: string): string | undefined {
    for (const [key, value] of cookieArray) {
        if (key === keyToExtract) {
            return value;
            }
        }
        return undefined;
    }

    export function buildJomaxCookieHeaderValue(req?: any): {} {
        const cookieArray = extractCookieValues(req);
        const authJomax = extractCookieByName(cookieArray,'auth_jomax');
        if (!authJomax) {
            throw new Error('auth_jomax cookie not found');
        }
        return{
                'Content-Type': 'application/json',
                'Cookie': `auth_jomax=${authJomax}`,
            };
    }
    export function getGuideDetails(req?: any): string {
        const cookieArray = extractCookieValues(req);
        const jomaxCookie = extractCookieByName(cookieArray, 'auth_jomax');
        if (!jomaxCookie) {
            throw new Error('auth_jomax cookie not found');
        }
        const decodeJomax= jwt.decode(jomaxCookie) as any;
        const guideAccountName=decodeJomax.accountName;
        return  guideAccountName;
    }
    /**
    * Scrub the guide details for the traffic service.
    * @param guide - The guide details to scrub.
    * @returns The scrubbed guide details.
    */
    export function scrubGuide(guide: any = {}): any {
        const { accountName, brand, department, managerUsername, title } = guide;
        return {
            guideJomax: accountName,
            guideBrand: brand,
            guideDepartment: department,
            guideManagerJomax: managerUsername,
            guideTitle: title,
        };
    }
    export function parseInsightValueToList(insightValue: string): Record<string, string> {
        if (!insightValue) {
            return {};
        }
      try {
        // Remove the curly braces and split by comma
        const cleanValue = insightValue.replace(/^{|}$/g, '');
        const pairs = cleanValue.split(', ');
        
        // Create key-value pairs where key is rank and value is product name
        const result: Record<string, string> = {};
        pairs.forEach(pair => {
          const [product, rank] = pair.split(' -> ');
          if (product?.trim() && rank?.trim()) {
            result[rank.trim()] = product.trim();
          }
        });
        
        return result;
      } catch (error) {
        return {};
      }
    }
}
