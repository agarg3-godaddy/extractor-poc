# Basic Node.js TypeScript Express API

A minimal Node.js project with TypeScript and Express that exposes basic GET and POST endpoints.

## Project Structure

```
├── src/
│   ├── index.ts          # Main server file
│   └── controller/
│       └── controller.ts # Basic controller with GET/POST methods
├── dist/                 # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server (requires build first)

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

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. The server will start on `http://localhost:3000`

## Testing the API

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
