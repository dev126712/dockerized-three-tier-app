# Dockerized-three-tier-app

## A demonstration of containerizing a three-tier logical application architecture using Node.js and orchestrating services with Docker Compose.

## Project Goal

#### The primary goal of this project is to showcase how to split a web application into separate, independent containers that communicate over an isolated Docker network. This adheres to the three-tier architecture pattern, even though the Data Tier is currently simulated for simplicity.

```

dockerized-three-tier-app/
├── docker-compose.yml
├── README.md
|
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── server.js
|
├── frontend/
│   ├── Dockerfile
│   ├── package.json       
│   ├── server.js          
│   └── public/
│      └──index.html

```  

## Prerequisites
#### You must have the following tools installed on your machine:

#### -Docker Desktop (or Docker Engine)

#### -Docker Compose 

## Local Setup and Run

### 1. Build and Start the Containers

#### The following command will build both the frontend and api-server images using their respective Dockerfiles, start the containers, and run them in detached mode (-d).

``` bash
sudo docker compose up --build -d
```

### 2. Access the Application


#### Frontend (Browser): http://localhost:8000

#### API (Direct Access): http://localhost:8080/api/products (useful for testing)

#### Database UI (Mongo Express): http://localhost:8081 (Use default credentials: admin:pass)

### 3. View Logs and Stop

#### To view the live logs from both services 

``` bash
sudo docker compose logs -f
```
### To stop and remove the running containers:

``` bash
sudo docker compose down
```





