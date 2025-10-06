## Day 3 DevOps Retrospective: Key Wins & Debugging

#### I achieved a fully parameterized deployment, successfully centralizing all sensitive credentials, ports, and configuration constants into a single .env file, establishing a foundation of Infrastructure as Code (IaC). This led to critical debugging efforts, including fixing the Frontend's connection error by correctly using ${window.location.hostname} for external browser access instead of internal Docker service names or localhost, and resolving a core MongoDB initialization failure by explicitly adding the MONGO_INITDB_DATABASE variable to Docker Compose to ensure the database existed upon container startup. Finally, we solidified service reliability by implementing Automated Health Checks across both the API and Frontend services, featuring a crucial Deep Readiness Probe on the API server that verifies successful database connectivity before marking the container as ready, which is essential for stable, production-grade deployments.

#### Result: The entire application is now deployed using the principle of Infrastructure as Code (IaC), making it portable and secure.

#### Challenge: Database Connection and Visibility (The Core Bug)
#### The Problem: Even with the correct DATABASE_URI defined, the database (mydatabase) wasn't appearing in Mongo Express, and the API server failed to connect, leading to the initial data insert failure.

#### The Fixes (Crucial DevOps Lesson):

#### Backend Connection: Corrected server.js to correctly use process.env.DATABASE_URI


#### Mongo Initialization: Added MONGO_INITDB_DATABASE=mydatabase to the mongo service in docker-compose.yml. This explicitly tells the MongoDB container to create the target database upon first startup, ensuring the API server has a place to write the initial data.





### MongoDB Server Started Without Authentication (Access Control Not Enabled)
#### Symptom:
#### The MongoDB container logs frequently showed the following warning, despite environment variables like MONGO_INITDB_ROOT_USERNAME and MONGO_INITDB_ROOT_PASSWORD being set:

#### msg":"Access control is not enabled for the database. Read and write access to data and configuration is unrestricted

### Root Cause:
#### While Docker's official MongoDB image entrypoint script handles creating the root user, the main MongoDB server process (mongod) often requires the --auth flag to explicitly enable access control. However, adding a custom command: mongod --auth often interferes with the official image's startup logic.

### Solution:
#### We removed the potentially conflicting command: mongod --auth and focused on ensuring Mongo Express was correctly configured to log in to the default administrative database (admin), where the root user is created:



### Custom Database Initialization Script Ignored
### Symptom:
#### The custom database (mydatabase) created by the ./database/init.js file was not created or visible, often because the initialization script was skipped on container restart.

### Root Cause:
#### When using a custom Dockerfile build (as indicated by the build: block), the automatic volume mount for initialization scripts needs to be explicitly maintained.

### Solution:
#### We ensured the volume mount for the initialization directory was included in the mongo service configuration. This forces the container to run all scripts inside the ./database folder on first run (when the volume is empty):

### In the mongo service:
#### volumes:
####  - database-v:/data/db
####  - ./database:/docker-entrypoint-initdb.d # Ensures init.js is executed



### Database Not Visible in Mongo Express UI
### Symptom:
#### Even after verifying the root user was created, Mongo Express would only show the default databases (admin, config, local), but not the user-created mydatabase.

### Root Cause:
#### Mongo Express needs to know which database to prioritize displaying, and sometimes requires explicit instruction to include user databases that it doesn't automatically detect upon initial connection.

### Solution (The Final Fix):
#### We added a specific environment variable to the mongo-express service that tells it to look for and use the custom database name. This solved the visibility issue:

### In the mongo-express service:
#### environment:
####   # ... (other settings)
####   ME_CONFIG_BASICAUTH_DB: mydatabase # Forces Mongo Express to acknowledge this database


### Conclusion: The Mandatory Step
#### For all database initialization and authentication changes to take effect, the existing data volume must be completely cleared, as the initialization scripts only run if the /data/db volume is empty.

#### The mandatory cleanup sequence was:
``` bash
docker-compose down
```
``` bash
docker volume rm database-v (destroy old data)
```

``` bash
sudo docker compose --env-file .env up --build
```



sudo docker compose --env-file .env up --build



### Empty Database and Data Insertion
### What Went Wrong
#### After connecting, the browser could access the API, but the data returned was an empty array ([]), leading the frontend to show "No products found."

### The Cause
#### Your MongoDB initialization script (init.js) had an incorrect syntax for insertMany(). This command requires a single argument, which must be an array of documents. You were passing the documents as separate arguments.

### JavaScript

#### // ❌ Incorrect: Documents passed as separate arguments
#### db.products.insertMany( {doc1}, {doc2} );
#### The Solution
#### We corrected init.js to wrap the product documents in a single array ([]) and then performed the critical step of rebuilding and recreating the MongoDB container to force the corrected initialization script to run.

### JavaScript

#### // ✅ Correct: Documents passed as a single array
#### db.products.insertMany( [ {doc1}, {doc2} ] );


### External Networking and CORS
### What Went Wrong
#### Even with data in the database, the browser showed: Connection Error: Failed to connect to http://api-service:8080... (or similar using the public IP).

### The Cause
### This was a two-part networking problem:

#### Docker Hostname: Your browser (running externally) could not resolve the internal Docker service name (api-service).

#### CORS Policy: Once the IP was used, the browser blocked the request because the API server (on port 8080) was considered a different origin from the frontend (usually on port 80).

### The Solution
#### Dynamic URL: We made the frontend URL dynamic using JavaScript to ensure the correct public IP was always used:

### JavaScript

#### const API_URL = `${window.location.protocol}//${window.location.hostname}:8080/api/products`;
#### CORS Middleware: We added the cors package to the API server and configured it. This required installing the package, adding the require('cors') line, and finally, a rebuild and restart of the API container to load the new dependency.










