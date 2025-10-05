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
| Presentation (Tier 1) | web_presentation_tier (Frontend) | Node.js Server | Serves the UI and fetches data. |(http://localhost:8000) |
| Application (Tier 2) | api_app_tier (API Server) | Node.js/Express | Handles business logic and database access. |(http://localhost:8080) |
| Data (Tier 3) | cont-mongodb (Database) | MongoDB 4.4 | Persistent storage for application data (products). | N/A (Internal) |
| Utility | mon-expr-cont (Database UI) | Mongo Express | Web interface for viewing MongoDB data. | http://localhost:8081 (Use admin:pass) |



### Data Initialization Confirmed

#### The api-server successfully connected to MongoDB and performed its initial setup logic, which included:

#### - Database Connection: It connected to the database named mydatabase.

#### - Collection Verification: It ensured the existence of the products collection (which your server.js mandates).

#### - Data Insert: It inserted the initial hardcoded product data (e.g., "Gemini AI Model") into this collection, as confirmed by the log: api_app_tier | Inserted initial hardcoded data into the database.

#### The application is now fully functional from the backend perspective, successfully serving product data to the frontend.




## Strategic Focus: Containerization and DevOps Benefits

#### We are using Docker containers and Docker Compose to manage this project, which brings major benefits to how we develop and operate the application.

### Containerization for Faster Development

#### - No More "It Works on My Machine": Each service (Frontend, API, Database) runs in its own isolated box called a container. This guarantees that the necessary software (like Node.js 18 or MongoDB) is always packaged correctly, making sure the app works the same for every developer and in every environment.

#### - Easy to Run Anywhere: The entire project can be launched on any computer (Mac, Windows, Linux) that has Docker, making it easy for new team members to get started.

#### - Quick Startup: We can start the entire multi-tier stack with just one simple command (docker compose up), saving us lots of setup time.



### Demonstrating DevOps Principles

#### The way we have set up the project follows modern DevOps practices:

#### 1. Infrastructure as Code (IaC): We've defined our entire application setup (all services, networks, and port settings) in a clear, written configuration file (docker-compose.yml). This ensures our environment is always reliable and reproducible.

#### 2. Ready for Automatic Updates: By using separate Docker images for each service, we've structured the project for future automation. This allows us to quickly and safely update just one part of the app (like the Frontend) without risking the entire system, making it ready for automated testing and deployment.









































