# Memory POC - Node.js TypeScript Express API

A Node.js project with TypeScript and Express that provides AI-powered memory services and CAAS (Conversational AI as a Service) integration for GoDaddy's digital care platform.

## Project Structure

```
├── src/
│   ├── index.ts                    # Main server file
│   ├── controller/
│   │   └── controller.ts           # API controllers
│   ├── interface/api/
│   │   ├── agent.ts               # GoDaddy Agent SDK integration
│   │   ├── caas-api.ts            # CAAS API client
│   │   └── pg-api.ts              # PostgreSQL API client
│   ├── service/
│   │   └── memoryService.ts       # Memory management service
│   ├── services/
│   │   └── redisService.ts        # Redis integration
│   ├── models/
│   │   ├── featureModel.ts        # Feature data models
│   │   └── shopperModel.ts        # Shopper data models
│   ├── constants/
│   │   ├── prompts.ts             # AI prompts
│   │   └── queryConstants.ts      # Database queries
│   └── utils/
│       └── helperUtil.ts           # Utility functions
├── dist/                          # Compiled JavaScript output
├── test/                          # Test files
├── package.json
├── tsconfig.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server (requires build first)

## CAAS API Client

The CAAS (Conversational AI as a Service) API client provides integration with GoDaddy's internal AI service for conversational AI capabilities.

### Features

- **Type-safe API calls** with full TypeScript support
- **Automatic authentication** using Jomax cookie headers
- **Error handling** with detailed logging and proper error messages
- **Content extraction** - returns just the AI response content
- **Configurable providers** and models via environment variables

### Usage

#### Basic Usage

```typescript
import { caasApi } from './src/interface/api/caas-api';

// Send a message and get just the content back
const content = await caasApi.sendMessage(
  req, // Express request object for authentication
  "You are a helpful assistant", // System prompt
  "Hello, how are you?" // User message
);

console.log(content); // "Hello! I'm doing well, thank you for asking..."
```

#### Advanced Usage

```typescript
import { CAASApi } from './src/interface/api/caas-api';

// Create a custom instance
const customCaas = new CAASApi(
  'https://caas.api.dev-godaddy.com/v1', // Custom base URL
  30000 // Custom timeout (30 seconds)
);

// Get full response object
const response = await customCaas.callCAAS(
  req,
  "You are a michelin star chef",
  "create tonight's dessert menu"
);

// Extract content from response
const content = customCaas.getContent(response);
```

### Environment Variables

Configure the CAAS client using these environment variables:

```bash
# Provider configuration
CAAS_PROVIDER=openai_chat          # Default: openai_chat
CAAS_MODEL=gpt-3.5-turbo          # Default: gpt-3.5-turbo

# API configuration
CAAS_BASE_URL=https://caas.api.dev-godaddy.com/v1  # Default: https://caas.api.dev-godaddy.com/v1
CAAS_TIMEOUT=30000                # Default: 30000ms
```

### API Response Structure

The CAAS API returns a comprehensive response object:

```typescript
interface CAASResponse {
  data: {
    id: string;                    // Unique request ID
    author: string;                // Request author
    cost: number;                  // API call cost
    status: string;               // Request status
    value: {
      from: string;               // Response source
      content: string;            // The actual AI response content
    };
    // ... additional metadata
  };
  status: number;                 // HTTP status code
}
```

### Error Handling

The client includes comprehensive error handling:

```typescript
try {
  const content = await caasApi.sendMessage(req, systemPrompt, userMessage);
  console.log('AI Response:', content);
} catch (error) {
  console.error('CAAS API Error:', error.message);
  // Handle different error types:
  // - Network errors
  // - Authentication errors  
  // - API rate limiting
  // - Invalid requests
}
```

### Authentication

The CAAS client automatically handles authentication using GoDaddy's Jomax cookie system:

- Extracts authentication cookies from the Express request object
- Builds proper headers for API authentication
- Handles authentication errors gracefully

### Rate Limiting & Costs

- Each API call includes cost tracking
- Monitor usage through the `cost` field in responses
- Built-in timeout handling to prevent hanging requests

## API Endpoints

### GET /api/data
Returns a simple JSON response with timestamp and method information.

**Response:**
```json
{
  "message": "Hello from GET endpoint!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "method": "GET"
}
```

### POST /api/data
Accepts JSON data and returns confirmation with the received data.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Data received successfully!",
  "receivedData": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "method": "POST"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```bash
   # CAAS API Configuration
   CAAS_PROVIDER=openai_chat
   CAAS_MODEL=gpt-3.5-turbo
   CAAS_BASE_URL=https://caas.api.dev-godaddy.com/v1
   CAAS_TIMEOUT=30000
   
   # Other service configurations
   PG_API_BASE_URL=https://pg.api.godaddy.com/v1/gql
   X_APP_KEY=care-agent
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **The server will start on `http://localhost:3000`**

### Prerequisites

- Node.js (v16 or higher)
- Access to GoDaddy's internal CAAS API
- Valid Jomax authentication cookies for API access

## Testing the API

### Basic Endpoints

You can test the endpoints using curl:

```bash
# Test GET endpoint
curl http://localhost:3000/api/data

# Test POST endpoint
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Test health check
curl http://localhost:3000/health
```

### Testing CAAS Integration

To test the CAAS API client, you can create a simple test script:

```typescript
// test/caas-test.ts
import { caasApi } from '../src/interface/api/caas-api';

async function testCAAS() {
  try {
    // Mock request object with authentication cookies
    const mockReq = {
      headers: {
        cookie: 'your-jomax-cookies-here'
      }
    };

    const response = await caasApi.sendMessage(
      mockReq,
      "You are a helpful assistant",
      "What is the weather like today?"
    );

    console.log('CAAS Response:', response);
  } catch (error) {
    console.error('CAAS Test Error:', error);
  }
}

testCAAS();
```

Run the test:
```bash
npx ts-node test/caas-test.ts
```

### Example CAAS Usage in Controllers

```typescript
// In your controller
import { caasApi } from '../interface/api/caas-api';

export class ChatController {
  async handleMessage(req: any, res: any) {
    try {
      const { message, systemPrompt } = req.body;
      
      const aiResponse = await caasApi.sendMessage(
        req,
        systemPrompt || "You are a helpful assistant",
        message
      );
      
      res.json({
        success: true,
        response: aiResponse,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
```
