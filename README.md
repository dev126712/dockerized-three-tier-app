### DevOps CI/CD Documentation
![alt text](https://github.com/dev126712/dockerized-three-tier-app/blob/64105d4d0de1f6b2286aa6f47ae82d9ba965c086/licensed-image.jpeg)
![alt text](https://github.com/dev126712/dockerized-three-tier-app/blob/edfa35fb944de110bd1977bae7f204915258a006/image.png)

# 1. Application CI/CD Pipeline ( docker-image.yml )


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

### -1. SAST Scan (Checkov)

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
````

### -2. Build & Artifacts: Build Docker images for all four services.

````
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
````

### -3. Security Scan (Trivy)

````
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
````
### -4. Publish: Push all secure and scanned images to Docker Hub.

````
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

  
````

![alt text](https://github.com/dev126712/dockerized-three-tier-app/blob/385680633ba2e36cb8d3122d7224dcd04eaf8e2c/Screenshot%202025-12-03%2011.14.39%20PM.png)



# 2. Infrastructure CI/CD Pipeline ( ci-infra.yml )

This pipeline manages the project's cloud infrastructure using Terraform, focusing on validation, quality, and security before deployment.



````
name: Deploy Terraform
on: 
  push:
    paths: 
      - '**.tf'
      - '.github/workflows/ci-infra.yml'
permissions:
  contents: read
  packages: read
  pull-requests: write
  
jobs:
````

### -1. Validate Terraform plan

````
validate-terraform-plan:
    env:
        AWS_ACCESS_KEY_ID: "${{ secrets.AWS_ACCESS_KEY_ID }}"
        AWS_SECRET_ACCESS_KEY: "${{ secrets.AWS_SECRET_ACCESS_KEY }}"
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: Infrastructure/
    steps:
      - name: Code Checkout
        uses: actions/checkout@v3

      - name: Set up Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Terraform init
        run: terraform init

      - name: Terraform fmt
        run: terraform fmt
        
      - name: Terraform validate
        run: terraform validate 

      - name: Terraform fmt check
        run: terraform fmt -check -recursive  
        
      - name: Terraform Plan
        run: terraform plan 
````

### -2. Pre-deploy security check(checkov)

````
pre_deploy_security_checks:
      needs: validate-terraform-plan
      runs-on: ubuntu-latest
      defaults:
        run:
          working-directory: Infrastructure/
      steps:
      - name: Code Checkout
        uses: actions/checkout@v4

      - name: Set up Python 3.9
        uses: actions/setup-python@v4
        with:
          python-version: 3.9  
  
      - name: Run Checkov Security Scan
        id: checkov
        uses: bridgecrewio/checkov-action@master
        with:
          directory: Infrastructure/
          framework: terraform
          output_format: cli
          soft_fail: true
          quiet: true
````

![alt text](https://github.com/dev126712/dockerized-three-tier-app/blob/03a21924fc9081f7141dd11238437ae44c90a984/Screenshot%202025-12-04%204.03.11%20PM.png)

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

# 3 Security scan Checkov ( security.yml )

````
name: security check

on:
  push:
    branches:
      - main
    paths: '**'

permissions:
  contents: read

jobs: 
````
### -1 Security scan on all the github workflows yml files
````
secirity-scan-on-workflows:
    runs-on: ubuntu-latest
    permissions:
      contents: write 
    steps:
    - name: checkout repo
      uses: actions/checkout@v4

    - name: Run Checkov Security Scan on yml files
      uses: bridgecrewio/checkov-action@master
      with:
        directory:  .github/workflows
        output_format: cli
        soft_fail: true
        quiet: true
````

### -2 Security scan on terraform files
````
secirity-scan-on-terraform-files:
    runs-on: ubuntu-latest
    permissions:
      contents: write 
    steps:
    - name: checkout repo
      uses: actions/checkout@v4

    - name: Run Checkov Security Scan on yml files
      uses: bridgecrewio/checkov-action@master
      with:
        directory:  ./Infrastructure
        output_format: cli
        soft_fail: true
        quiet: true 
````

