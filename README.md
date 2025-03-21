<div align="center">

<a href="https://example.com" target="_blank" title="DuxSoup ETL System"><img width="196px" alt="DuxSoup ETL logo" src="https://raw.githubusercontent.com/duxsoup/ETL/logo.png"></a>

<a name="readme-top"></a>

DuxSoup ETL System
==================

A fully automated, webhook-driven ETL pipeline that integrates with the DuxSoup API to extract, normalize, and store detailed LinkedIn profile data into MongoDB Atlas.<br/> Engineered for data enthusiasts and LinkedIn automation, it provides real-time insights by seamlessly processing profile information.

[](https://nodejs.org/)\
[](https://www.mongodb.com/)

**↘  Official Documentation  ↙**\
English - Español

**↘  Share the project's link  ↙**\
[](https://twitter.com/intent/tweet?url=https://example.com)

[](https://www.reddit.com/submit?url=https://example.com)

<a href="https://example.com" target="_blank" title="DuxSoup ETL System"><img width="99%" alt="DuxSoup ETL system workflow" src="https://raw.githubusercontent.com/duxsoup/ETL/overview.gif"></a>

</div>

✨ Features
----------

-   **Programmatic Integration**: Seamlessly connect with DuxSoup Turbo to fetch LinkedIn profile data.
-   **Automated Data Ingestion**: Utilizes webhook-driven JSON payloads for real-time data capture---no polling required.
-   **Structured Data Normalization**: Automatically transforms raw LinkedIn data into organized arrays (e.g., positions, schools, skills) for enhanced analysis.
-   **Optimized Search Indexing**: Fast company and industry lookups with dedicated indexing.
-   **Always-On Processing**: Deployed on Render with continuous health checks to ensure reliability.
-   **Cloud-Based Storage**: Leverages MongoDB Atlas and Mongoose for scalable, secure data management.
-   **Robust Logging**: Integrated Winston logging for comprehensive monitoring and troubleshooting.

🚀 Overview
-----------

The DuxSoup ETL System streamlines the data extraction process from LinkedIn by integrating with the DuxSoup browser extension. Here's how it works:

1.  **Profile Visits**:\
    DuxSoup visits LinkedIn profiles and extracts detailed connection data.

2.  **Webhook Ingestion**:\
    The extracted data is sent directly as structured JSON to a Render-hosted Express.js webhook, eliminating the need for continuous polling.

3.  **Data Transformation**:\
    The system normalizes key LinkedIn fields into well-organized arrays:

    -   `positions[]`: Employment history details.
    -   `schools[]`: Educational background.
    -   `skills[]`: A list of skills.
4.  **Data Storage**:\
    Processed data is stored in MongoDB Atlas across two collections:

    -   **visits**: Comprehensive dataset from profile visits.
    -   **scans**: A summarized dataset from profile scans.

This design ensures that your LinkedIn data is always ready for deep analysis and rapid insights.

⚙️ How It Works
---------------

-   **Data Extraction**:\
    The DuxSoup browser extension navigates your LinkedIn network to extract first-degree connection details.

-   **Webhook Processing**:\
    An Express.js application hosted on Render receives the JSON payloads via a webhook endpoint, ensuring real-time data flow.

-   **Data Normalization**:\
    Incoming data is parsed and categorized into distinct arrays for positions, skills, and schools, making it straightforward to analyze.

-   **Persistent Storage**:\
    The system stores data in MongoDB Atlas, with two main collections:

    -   **visits**: For extensive data from profile visits.
    -   **scans**: For limited data snapshots from profile scans.
-   **Continuous Monitoring**:\
    Health checks on Render keep the ETL pipeline running smoothly, ensuring constant data availability.

📦 Tech Stack
-------------

| **Layer** | **Technology** |
| --- | --- |
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js |
| **Database** | MongoDB Atlas + Mongoose |
| **Logging** | Winston |
| **Dev Tools** | Nodemon, dotenv |
| **Deployment** | Render (Free Tier) |

🛠️ Setup & Installation
------------------------

1.  **Clone the Repository**:

    bash

    Copy code

    `git clone https://github.com/yourusername/duxsoup-etl.git
    cd duxsoup-etl`

2.  **Install Dependencies**:

    bash

    Copy code

    `npm install`

3.  **Configure Environment Variables**:\
    Create a `.env` file in the project root with the following variables:

    -   `MONGO_URI`: Your MongoDB Atlas connection string.
    -   `DUXSOUP_API_KEY`: API key for accessing DuxSoup data.
    -   Additional configuration settings as needed.
4.  **Start the Application**:

    bash

    Copy code

    `npm start`

5.  **Deploy on Render**:\
    The project is pre-configured for deployment on Render. Follow Render's documentation to deploy your instance and configure automatic health checks.

🤝 Contributing
---------------

Contributions are welcome! Feel free to fork the repository and submit a pull request. For questions, issues, or feature requests, please open an issue on GitHub or contact the maintainer.