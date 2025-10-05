## Day 2 Project: Three-Tier Stack is Live!

### Overview

#### Building on the foundational work from Day 1 (defining the Dockerfiles and docker-compose.yml), we successfully built, deployed, and established inter-container communication for the three-tier application stack using docker compose. All three core services are now running, and the API has confirmed connectivity to the database and inserted the initial data.

## Day 2 Goal:

### Verify the Deployment and Data Integrity

#### The goal for Day 2 was to run the complete, three-tier application using the files created yesterday and confirm that all services—Frontend, API, and MongoDB—are communicating correctly and that the initial product data is successfully stored.


## The Successful Outcome:

### All Tiers are Communicating

#### The deployment was a success! Running the following command brought up the entire stack: 
``` bash
sudo docker compose up --build --remove-orphans
```
#### This command ensured all services were rebuilt and any outdated components were removed, resulting in a clean and successful deployment with verified inter-container communication.





| Tier | Service Name | Technology | Function | Access Point |
|----------|----------|----------|----------|----------|
| Presentation (Tier 1) | web_presentation_tier (Frontend) | Node.js Server | Serves the UI and fetches data. | [Row 1 Col 3](http://localhost:8000) |
| Application (Tier 2) | api_app_tier (API Server) | Node.js/Express | Handles business logic and database access. |(http://localhost:8080) |
| Data (Tier 3) | cont-mongodb (Database) | MongoDB 4.4 | Persistent storage for application data (products). | application data (products).

N/A (Internal) |
| Utility | mon-expr-cont (Database UI) | Mongo Express | Web interface for viewing MongoDB data. | http://localhost:8081 (Use admin:pass) |
