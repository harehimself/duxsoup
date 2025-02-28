# DuxSoup ETL System

This application receives LinkedIn profile data from DuxSoup via webhooks, processes it, and stores it in MongoDB Atlas.

## How It Works

1. **DuxSoup Browser Extension**: Visits LinkedIn profiles through your browser
2. **Webhook Integration**: DuxSoup sends profile data to your app's webhook endpoint
3. **Data Processing**: Your app processes and normalizes the received data
4. **MongoDB Storage**: Processed data is stored in MongoDB Atlas for later use

## Setup Instructions

### 1. Deploy the Application

1. Deploy this app to Render.com (or similar service)
2. Set up all environment variables in the deployment platform
3. Note your app's public URL (e.g., `https://your-app.onrender.com`)

### 2. Configure DuxSoup Webhooks

1. Log in to your DuxSoup Turbo account
2. Go to DuxSoup Options → Connect tab
3. Enable Webhooks
4. Set the Target URL to `https://your-app.onrender.com/api/webhook`
5. Select these event types:
   - Visit
   - Scan
   - Action (optional)
   - Message (optional)
6. Click "Send Sample" to test the integration

### 3. Use DuxSoup to Visit Profiles

1. Use DuxSoup to visit LinkedIn profiles manually or automatically
2. As profiles are visited, data will be sent to your webhook
3. The data will be automatically processed and stored in MongoDB

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/visits` - Get all stored visits from MongoDB

## Environment Variables

- `MONGO_URI` - MongoDB Atlas connection URI
- `MONGO_DB_NAME` - MongoDB database name
- `MONGO_COLLECTION_NAME` - MongoDB collection name

## Tracking Activity

Monitor the logs of your deployed application to see:
- Webhook events received
- Data processing activities
- Database operations

## Architecture

```
DuxSoup (Browser) → Webhook → Your App → MongoDB
```

The system is entirely webhook-driven. No periodic fetching or API polling is needed, as DuxSoup will push data to your app whenever profiles are visited.