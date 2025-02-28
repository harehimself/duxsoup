# DuxSoup ETL System

This application automatically extracts LinkedIn profile data from first-degree connections using the DuxSoup API, processes it, and stores it in MongoDB Atlas.

## Features

- Fetches first-degree LinkedIn connections via DuxSoup API
- Processes and normalizes the data
- Stores data in MongoDB Atlas
- Runs on a configurable interval
- Groups related data (positions, schools, skills)
- Includes error handling and logging

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your .env file with your credentials (already included)
4. Start the application:
   ```
   npm start
   ```

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /api/fetch` - Manually trigger a data fetch
- `GET /api/visits` - Get all stored visits

## Deployment

This application can be deployed to a free cloud service like:

- Render.com
- Railway.app
- Fly.io
- Heroku (free tier discontinued but legacy apps may still run)

### Deployment Steps

1. Sign up for a free account at one of the above services
2. Connect your GitHub repository or upload the code directly
3. Set the environment variables
4. Deploy the application

## Environment Variables

- `MONGO_URI` - MongoDB Atlas connection URI
- `MONGO_DB_NAME` - MongoDB database name
- `MONGO_COLLECTION_NAME` - MongoDB collection name
- `DUXSOUP_API_KEY` - Your DuxSoup API key
- `FETCH_INTERVAL` - Interval in milliseconds between fetches (default: 3600000, i.e., 1 hour)