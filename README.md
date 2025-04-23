# OpenAI Streaming API for AWS Lambda

A Node.js backend with Express and OpenAI integration for creating a streaming API, deployable to AWS Lambda.

## Features

- RESTful API endpoints for OpenAI text generation
- Streaming response implementation for real-time text updates
- Error handling and request validation
- AWS Lambda compatibility for serverless deployment
- Environment-based configuration management
- API rate limiting and security measures
- OpenAI token usage tracking
- Middleware for request logging and monitoring

## Prerequisites

- Node.js 18 or higher
- OpenAI API key
- AWS account (for Lambda deployment)
- Serverless Framework (for deployment)

## Getting Started

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in your OpenAI API key
4. Start the development server
   ```
   npm run dev
   ```

## API Endpoints

### Health Check
- `GET /api/health`
  - Returns the server status

### OpenAI Completions
- `POST /api/completions`
  - Standard (non-streaming) completions endpoint
  - Request body:
    ```json
    {
      "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, how are you?"}
      ],
      "model": "gpt-4-turbo-preview",
      "temperature": 0.7,
      "max_tokens": 500
    }
    ```

### OpenAI Streaming Completions
- `POST /api/completions/stream`
  - Streaming completions endpoint
  - Same request body as standard completions
  - Returns a stream of server-sent events (SSE)

## Client Example

```javascript
// Example of consuming the streaming API from a frontend
const fetchStream = async () => {
  const response = await fetch('https://your-api-url/api/completions/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {role: 'system', content: 'You are a helpful assistant.'},
        {role: 'user', content: 'Write a short story about a robot.'}
      ],
      model: 'gpt-4-turbo-preview',
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const {value, done} = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.replace('data: ', '');
        if (jsonStr === '[DONE]') break;
        
        try {
          const json = JSON.parse(jsonStr);
          console.log(json.content);
          // Update your UI with the streamed content
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      }
    }
  }
};

fetchStream();
```

## Deployment to AWS Lambda

1. Install the Serverless Framework globally
   ```
   npm install -g serverless
   ```

2. Configure your AWS credentials
   ```
   serverless config credentials --provider aws --key YOUR_AWS_KEY --secret YOUR_AWS_SECRET
   ```

3. Deploy to AWS
   ```
   serverless deploy
   ```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `OPENAI_API_KEY`: Your OpenAI API key
- `DEFAULT_MODEL`: Default OpenAI model to use
- `REQUEST_TIMEOUT`: Timeout for OpenAI requests in milliseconds
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window in milliseconds
- `RATE_LIMIT_MAX`: Maximum number of requests in the rate limit window

## License

MIT