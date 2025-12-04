# Dockerized Three-Tier Architecture

## A demonstration of robust containerization, microservices orchestration, and environment parity using Node.js, MongoDB, Nginx(reverse proxy) and Docker Compose.

## Project Goal (Architectural Focus)

 The primary goal of this project is to showcase how to split a web application into separate, independent containers that communicate over an isolated Docker network. This adheres to the three-tier architecture pattern, even though the Data Tier is currently simulated for simplicity.


### This setup demonstrates critical skills required for modern, production-ready systems, including:

****Microservices Orchestration****: Managing independent services using Docker Compose

****Environment Parity****: Ensuring the development and production environment behave identically.

****Network Segmentation****: Utilizing a dedicated Docker network for secure inter-service communication.
  
## Prerequisites
#### You must have the following tools installed on your machine:

#### -Docker Desktop (or Docker Engine)

#### -Docker Compose 

## Local Setup and Run

### 1. Build and Start the Containers

#### The following command will build both the frontend and api-server images using their respective Dockerfiles, start the containers, and run them in detached mode (-d).

``` bash
sudo docker compose --env-file .env up --build
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


```

dockerized-three-tier-app/
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
|
├── database/
│   ├── Dockerfile
│   └── init.js
|
├── proxy/
│   ├── Dockerfile
│   └── nginx.conf.template
|
├── docker-compose.yml
├── README.md
└── .env
```




### Three-Tier Application CI/CD Pipeline

This document describes the automated Continuous Integration and Continuous Delivery (CI/CD) workflow for the dockerize-three-tier-application project, powered by GitHub Actions.

This pipeline is designed for a multi-service application (Frontend, Backend, Database, and Proxy) and ensures that all components pass configuration and vulnerability scans before being built and published to Docker Hub.

## 1. Workflow Overview

The entire process is designed to run in parallel where possible, maximizing efficiency while maintaining a strict sequence of security checks and builds.

![alt text](https://github.com/dev126712/dockerized-three-tier-app/blob/64105d4d0de1f6b2286aa6f47ae82d9ba965c086/licensed-image.jpeg)

# High-Level Flow:

1. Security Scan (Shift Left): Run Checkov on configuration files for all four services.

2. Build & Artifacts: Build Docker images for all four services in parallel, depending on their Checkov scan passing.

3. Vulnerability Scan: Run Trivy on all four built Docker images.

4. Publish: Push all secure and scanned images to Docker Hub.



## 2. Trigger and Permissions


| Setting | Value | Description |
| ------------- | ------------- | ------------- |
| Name | Scan Docker Images, Build Docker Images & Publish it to Docker Hub | he name displayed in the GitHub Actions tab. | 
| Trigger | push to main branch |The workflow is triggered automatically upon pushing code to the main branch. | 
| Path Filtering | backend/, frontend/, database/, proxy/, .github/workflows/*.yml|Only triggers if files in the service directories or the workflow file itself are modified. | 
| Permissions |contents: read, security-events: write|Required for checkout and writing security scanning results (e.g., Checkov reports) back to GitHub Security.|

## 3. Workflow Jobs Structure

The workflow is divided into three main stages, utilizing the needs keyword for dependency management.

# Stage A: Configuration Security Scans (Checkov)

These jobs run first and are responsible for validating the configuration of the service directories (e.g., Dockerfiles, YAML files). They run concurrently.

|Job Name | Dependency | Purpose |Tool|
| ------------- | ------------- | ------------- | ------------- |
| secirity-scan-Checkov-frontend | None |Scans the frontend/ directory for misconfigurations.| Checkov |
| secirity-scan-Checkov-backend|None | Scans the backend/ directory for misconfigurations. |
| secirity-scan-Checkov-proxy| None | Scans the proxy/ directory for misconfigurations. | Checkov |
| secirity-scan-Checkov-database | None | Scans the database/ directory for misconfigurations.| Checkov |

# Stage B: Build, Artifact, and Vulnerability Scans
These jobs depend on the Checkov scans passing for their respective components. They build the Docker image, save it as a build artifact, and then run a vulnerability scan (Trivy).

| Job Name | Dependency | Purpose | Tool |
| ------------- | ------------- | ------------- | ------------- |
| build-image-frontend | secirity-scan-Checkov-frontend | builds the Docker image for the Frontend and uploads it as an artifact. | Docker Buildx
|build-image-backend | secirity-scan-Checkov-backend | Builds the Docker image for the Backend and uploads it as an artifact. | Docker Buildx |
| build-image-proxy | secirity-scan-Checkov-proxy | Builds the Docker image for the Proxy and uploads it as an artifact. |  Docker Buildx |
| build-image-database | secirity-scan-Checkov-database | Builds the Docker image for the Database and uploads it as an artifact. | Docker Buildx |
| scan-frontend-with-trivy | build-image-frontend | Downloads the Frontend artifact, loads it, and runs a Trivy vulnerability scan. | Trivy |
| scan-backend-with-trivy | build-image-backend | Downloads the Backend artifact, loads it, and runs a Trivy vulnerability scan. | Trivy |
| scan-proxy-with-trivy | build-image-proxy | Downloads the Proxy artifact, loads it, and runs a Trivy vulnerability scan. | Trivy |
| scan-database-with-trivy | build-image-database | Downloads the Database artifact, loads it, and runs a Trivy vulnerability scan. | Trivy |

## Stage C: Publishing Images (Push to Docker Hub)

These final jobs run only if the corresponding build and Trivy scan jobs pass. They authenticate with Docker Hub, tag the image with the correct repository prefix and SHA, and push the image.

| Job Name | Dependency | Purpose |
| ------------- | ------------- | ------------- |
| push-frontend-image-to-dockerhub | scan-frontend-with-trivy | Tags and pushes the secure Frontend image. |
| push-backend-image-to-dockerhub | scan-backend-with-trivy | Tags and pushes the secure Backend image. |
| push-proxy-image-to-dockerhub | scan-proxy-with-trivy | Tags and pushes the secure Proxy image. |
| push-database-image-to-dockerhub | scan-database-with-trivy | Tags and pushes the secure Database image. |

## 4. Required GitHub Secrets

This pipeline requires the following secrets to be configured in your GitHub repository settings (Settings -> Security -> Secrets and variables -> Actions):

| Secret Name | Purpose |
| ------------- | ------------- |
| DOCKERHUB_USERNAME | Your Docker Hub username, used to prefix the repository names (e.g., username/app-backend). |
| DOCKER_HUB_TOKEN | A Docker Hub Access Token with Read, Write, and Delete permissions, used to log in and push the final images. |

![alt text](https://github.com/dev126712/dockerized-three-tier-app/blob/385680633ba2e36cb8d3122d7224dcd04eaf8e2c/Screenshot%202025-12-03%2011.14.39%20PM.png)

This documentation provides a comprehensive overview of your CI/CD workflow! Let me know if you would like to integrate any of the advanced security features we discussed earlier (like hard security gates or SBOM generation) into this new multi-tier pipeline, or if you want to detail the contents of your service-specific Dockerfiles.
