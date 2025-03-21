# 🧠 DuxSoup ETL System

A fully automated, webhook-driven ETL pipeline that integrates with the **DuxSoup API** to extract, normalize, and store detailed **LinkedIn profile data** into **MongoDB Atlas**. This system is deployed on **Render** for always-on background processing.

---

## 🚀 Overview

This project allows you to automatically fetch first-degree LinkedIn connection data using DuxSoup, structure the data into normalized arrays (positions, skills, schools), and persist everything to MongoDB for rich analysis.

### Key Features

- 🔗 Programmatic integration with DuxSoup Turbo
- 🧰 Structured transformation of LinkedIn fields
- 🌐 Webhook-based ingestion (no polling needed)
- 🗃️ Indexing for fast company and industry search
- ☁️ Deployed on [Render](https://render.com/) with health checks

---

## ⚙️ How It Works

DuxSoup (browser extension) ➝ Webhook (Render-hosted Express app) ➝ Data normalization (positions, skills, schools) ➝ MongoDB Atlas (visits & scans collections)

1. **DuxSoup visits profiles** from your LinkedIn account.
2. **Webhook endpoint receives structured JSON data** directly from DuxSoup.
3. Data is parsed and grouped into:
   - 📁 `positions[]`
   - � `schools[]`
   - 💡 `skills[]`
4. Processed data is saved in:
   - `visits` collection for profile visits
   - `scans` collection for scans

---

## 📦 Tech Stack

| Layer | Technology | |-------------|--------------------------------| | Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB Atlas + Mongoose |
| Logging | Winston |
| Dev Tools | Nodemon, dotenv |
| Deployment | Render (Free Tier) |
---

## 🛠️ Setup & Deployment

### 1\. Environment Variables

Create a `.env` file with:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
MONGO_DB_NAME=duxsoup
MONGO_COLLECTION_NAME=visits
SCAN_COLLECTION_NAME=scans
DUXSOUP_API_KEY=your_duxsoup_key
DUXSOUP_USER_ID=your_user_id
FETCH_INTERVAL=3600000

### 2\. Render Configuration

yaml

Copy

# render.yml
services:
  - type: web
    name: duxsoup-etl
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node src/index.js
    healthCheckPath: /health

### 3\. Deploy to Render

-   Connect repo to Render

-   Add `.env` keys under "Environment Variables"

-   Hit deploy 🎉

* * * * *

🔗 DuxSoup Webhook Setup
------------------------

1.  Open DuxSoup → Options → **Connect tab**

2.  Enable Webhooks

3.  Target URL: `https://your-app.onrender.com/api/webhook`

4.  Select event types:

    -   ✅ Visit

    -   ✅ Scan

    -   (Optional) Action, Message

5.  Send test payload ✅

* * * * *

📡 API Endpoints
----------------

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Health check for Render |
| GET | `/api/visits` | View all stored visit data |
| GET | `/api/scans` | View all scan data |
| GET | `/api/analysis/company/:company` | Company-specific people insights |
| POST | `/queue/visit` | Queue a visit action to LinkedIn profile |
| POST | `/queue/connect` | Queue a connection request |
| POST | `/queue/message` | Send a message to 1st-degree connection |

* * * * *

🔍 Data Schema Highlights
-------------------------

### Visits Collection

-   **Normalized fields**:

    -   `positions[]`

    -   `schools[]`

    -   `skills[]`

-   **Raw fields**:

    -   `First Name`, `Last Name`, `Degree`, etc.

### Indexes

Created programmatically in `addIndexes.js` for:

js

Copy

{ Company: 1 }
{ "positions.company": 1 }

* * * * *

🧪 Test Mongo Connection
------------------------

bash

Copy

node test-connection.js

You'll see:

-   Connected status

-   List of collections

-   Document count

* * * * *

📈 Logs & Observability
-----------------------

All logs are written to:

-   `combined.log` for all traffic

-   `error.log` for failures

Viewable via Render or local Winston setup.

* * * * *

📝 License
----------

MIT --- use freely, contribute gladly.

Built with ❤️ for LinkedIn automation.