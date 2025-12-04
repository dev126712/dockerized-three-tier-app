### DevOps CI/CD Documentation
![alt text](https://github.com/dev126712/dockerized-three-tier-app/blob/64105d4d0de1f6b2286aa6f47ae82d9ba965c086/licensed-image.jpeg)

# 1. Application CI/CD Pipeline


```
name: Scan Docker Images, Build Docker Images & Publish it to Docker Hub
on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
      - 'frontend/**'
      - 'database/**'
      - 'proxy/**'
      - '.github/workflows/*.yml' 
permissions:
  contents: read
  security-events: write
      
jobs:
```

1. SAST Scan (Checkov)

````
  secirity-scan-Checkov-backend:
    runs-on: ubuntu-latest
    permissions:
      contents: write 
    steps:
    - name: checkout repo
      uses: actions/checkout@v4
    
    - name: Run Checkov Security Scan on backend
      uses: bridgecrewio/checkov-action@master
      with:
        directory: backend/
        output_format: cli
        soft_fail: true
        quiet: true
```

2. Build & Artifacts: Build Docker images for all four services.

```
  build-image-backend:     
    needs: secirity-scan-Checkov-backend
    runs-on: ubuntu-latest
    permissions:
      contents: write 
    env:
      IMAGE_NAME_BACKEND: dockerized-three-tier-app-backend
      IMAGE_LATEST_TAG_BACKEND: ${{ secrets.GIT_USERNAME }}/dockerized-three-tier-app-backend:latest
      BACKEND_TAG: dockerized-three-tier-app-backend:latest, dockerized-three-tier-app-backend:${{ github.sha }}
    steps:
    - name: checkout repo
      uses: actions/checkout@v4

    - name: Set up QEMU 
      uses: docker/setup-qemu-action@v3 

    - name: set up docker
      uses: docker/setup-buildx-action@v2

    - name: Build the Docker images
      uses: docker/build-push-action@v6
      with:
        context: ./backend
        push: false
        tags: ${{ env.BACKEND_TAG }}
        load: true
        outputs: type=docker,dest=/tmp/${{ env.IMAGE_NAME_BACKEND }}.tar

    - name: Upload Image Artifact
      uses: actions/upload-artifact@v4
      with:
        name: ${{ env.IMAGE_NAME_BACKEND }}
        path: /tmp/${{ env.IMAGE_NAME_BACKEND }}.tar
```

3. Security Scan (Trivy)

```
  scan-backend-with-trivy:
    name: Trivy Security Scan Image Backend
    runs-on: ubuntu-latest
    permissions:
      contents: write 
    needs: build-image-backend
    env:
      IMAGE_NAME_BACKEND: dockerized-three-tier-app-backend
    steps:
    - name: Download Image artifact
      uses: actions/download-artifact@v4
      with:
        name: ${{ env.IMAGE_NAME_BACKEND }}
        path: /tmp

    - name: Load image
      run: |
        docker load --input /tmp/${{ env.IMAGE_NAME_BACKEND }}.tar
        docker image ls -a

    - name: Install Trivy
      run: |
        sudo apt-get update
        sudo apt-get install -y curl
        curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sudo sh -s -- -b /usr/local/bin v0.57.0
  
    - name: Download Trivy vulnerability database
      run: trivy image --download-db-only
      
    - name: Run Trivy vulnerability scan
      run: |
        trivy image \
          --exit-code 0 \
          --format table \
          --ignore-unfixed \
          --pkg-types os,library \
          --severity CRITICAL,HIGH,MEDIUM \
          ${{ env.IMAGE_NAME_BACKEND }}:latest
```
4. Publish: Push all secure and scanned images to Docker Hub.

```
push-backend-image-to-dockerhub:
    name: Push Backend Image to Docker Hub
    runs-on: ubuntu-latest
    permissions:
      contents: write 
    needs: scan-backend-with-trivy
    env:
      IMAGE_NAME_BACKEND: dockerized-three-tier-app-backend
      
    steps:
    - name: Download Image artifact
      uses: actions/download-artifact@v4
      with:
        name: ${{ env.IMAGE_NAME_BACKEND }}
        path: /tmp

    - name: Load image
      run: |
        docker load --input /tmp/${{ env.IMAGE_NAME_BACKEND }}.tar
        docker image ls -a

    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKER_HUB_TOKEN }}

    - name: Tag Image with Docker Hub Username Prefix
      run: |
        DOCKER_REPO="${{ secrets.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME_BACKEND }}"
        
        docker tag ${{ env.IMAGE_NAME_BACKEND }}:latest $DOCKER_REPO:latest
        
        docker tag ${{ env.IMAGE_NAME_BACKEND }}:latest $DOCKER_REPO:${{ github.sha }}

    - name: Push Image to Docker Hub
      run: |
        DOCKER_REPO="${{ secrets.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME_BACKEND }}"
        
        docker push $DOCKER_REPO:latest
        docker push $DOCKER_REPO:${{ github.sha }}

    - name: Docker - Logout
      run: docker logout

  
```

![alt text](https://github.com/dev126712/dockerized-three-tier-app/blob/385680633ba2e36cb8d3122d7224dcd04eaf8e2c/Screenshot%202025-12-03%2011.14.39%20PM.png)

| Setting | Value | Description |
| ------------- | ------------- | ------------- |
| Name | Scan Docker Images, Build Docker Images & Publish it to Docker Hub | he name displayed in the GitHub Actions tab. | 
| Trigger | push to main branch |The workflow is triggered automatically upon pushing code to the main branch. | 
| Path Filtering | backend/, frontend/, database/, proxy/, .github/workflows/*.yml|Only triggers if files in the service directories or the workflow file itself are modified. | 
| Permissions |contents: read, security-events: write|Required for checkout and writing security scanning results (e.g., Checkov reports) back to GitHub Security.|

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

![alt text](https://github.com/dev126712/dockerized-three-tier-app/blob/385680633ba2e36cb8d3122d7224dcd04eaf8e2c/Screenshot%202025-12-03%2011.14.39%20PM.png)

## 2. Infrastructure CI/CD Pipeline

This pipeline manages the project's cloud infrastructure using Terraform, focusing on validation, quality, and security before deployment.

### Trigger and Permissions
| Setting | Value | Description |
| ------------- | ------------- | ------------- |
| Trigger | ``` push ``` | Runs automatically on changes. |
| Path Filtering | ``` **.tf, .github/workflows/ci-infra.yml ``` | Only triggers if Terraform files or the workflow file itself are changed. |
| Required Secrets | ``` AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY ``` | Credentials for authenticating with AWS during init and plan. |

### Pipeline Stages

The workflow executes in two sequential stages:
# Job 1: validate-terraform-plan (Validation and Planning)
This job ensures code quality and correctness.

| Step Name | Purpose |
| ------------- | ------------- |
|  Terraform init |  Initializes the working directory and authenticates with AWS. |
| Terraform fmt & validate  |  Enforces code formatting standards and checks for syntax errors. |
|  Terraform Plan | Generates a plan showing all proposed changes, essential for manual review before application.  |

![alt text](https://github.com/dev126712/dockerized-three-tier-app/blob/03a21924fc9081f7141dd11238437ae44c90a984/Screenshot%202025-12-04%204.03.11%20PM.png)

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
