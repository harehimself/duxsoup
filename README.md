# DuxSoup ETL System

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
3. Contact data is parsed and organized. Data groupings include:
   - `positions[]`
   - `schools[]`
   - `skills[]`

4. Processed data is saved in:
   - `visits` extensive dataset from profile visits
   - `scans` limited dataset from profile scans


---


## 📦 Tech Stack

| Layer       | Technology              |
|-------------|--------------------------|
| Runtime     | Node.js 18+             |
| Framework   | Express.js              |
| Database    | MongoDB Atlas + Mongoose|
| Logging     | Winston                 |
| Dev Tools   | Nodemon, dotenv         |
| Deployment  | Render (Free Tier)      |




Built with ❤️ for LinkedIn automation.