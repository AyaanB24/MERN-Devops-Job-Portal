# Phase 0: Server & Database Setup

This phase established the project foundations, setting up the Node.js/Express server and the Mongoose/MongoDB connection.

---

## 📂 File Architecture

Below are the key files that form the backbone of the backend server:

```
backend/
├── .env
├── package.json
├── server.js
└── src/
    ├── app.js
    └── config/
        └── db.js
```

---

## 📝 Detailed File Breakdown

### 1. `backend/server.js`
*   **Purpose**: The main execution entry point for starting the backend server.
*   **Key Responsibilities**:
    *   Loads environment variables using `dotenv.config()`.
    *   Invokes the database connection utility.
    *   Listens for incoming network connections on the configured `PORT` (defaults to `5000`).

### 2. `backend/src/app.js`
*   **Purpose**: Configures the Express application framework and globally mounts base middleware.
*   **Key Responsibilities**:
    *   Initializes the Express app instance (`const app = express()`).
    *   Configures body parsers (`express.json()`, `express.urlencoded()`) to extract request payloads.
    *   Mounts Cross-Origin Resource Sharing (`cors()`) middleware to allow frontend applications to query the API.
    *   Defines a root health-check endpoint (`GET /`) to confirm backend uptime status.

### 3. `backend/src/config/db.js`
*   **Purpose**: Standardizes the connection lifecycle to MongoDB using the Mongoose ODM.
*   **Key Responsibilities**:
    *   Exposes an asynchronous function that reads the `MONGO_URI` connection string from environment variables.
    *   Initializes the connection and logs status updates (or handles errors if connection fails).

### 4. `backend/.env`
*   **Purpose**: Stores local configuration parameters and sensitive environment keys (e.g. database credentials, server port limits) separate from code repositories.

### 5. `backend/package.json`
*   **Purpose**: Lists npm package dependencies, versions, metadata, and development execution script definitions (e.g., using `nodemon` for hot-reloads during development).
