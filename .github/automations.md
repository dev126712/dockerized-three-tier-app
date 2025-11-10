# 🚀 Continuous Integration and Delivery (CI/CD)

This repository utilizes GitHub Actions to automate the build, security scanning(Trivy), publishing the Image to Docker Hub only if the scanning have not find a bug or vulnerability then create a repository "Github Actions/Trivy Automations" and put the scanning result to a file"scan-results.json". This ensures that every time code is merged into the main branch, the deployed images are up-to-date and secure.

## Workflow: Build, Scan & Publish to Docker Hub

|Component | Image Name |
| --- | --- |
| `Backend ` | dev126712/dockerized-three-tier-app-backend:latest |
| `Frontend` | dev126712/dockerized-three-tier-app-frontend:latest |
| `Database` | dev126712/dockerized-three-tier-app-database:latest |
| `Proxy` | dev126712/dockerized-three-tier-app-proxy:latest |

# 📋 Automation Steps

### The workflow runs on every push to the main branch, but only if changes are detected in one of the service Dockerfiles or the GitHub workflow configuration itself.

| Step | Purpose | Security Implication |
| --- | --- | --- |
| `1. Build the Docker Images ` | Compiles and packages the application code into the four distinct Docker images, tagging them with :latest locally. | Ensures the resulting artifacts are ready for the security check. |
| ` 2. Install Trivy` | Installs Trivy, a comprehensive open-source vulnerability scanner, onto the GitHub Actions runner environment. | Sets up the necessary tool for performing deep security analysis. |
| `3. Run Trivy Vulnerability Scanner` | Scans all four locally built Docker images. The scan checks the operating system packages and application dependencies for known security vulnerabilities. | Quality Gate: This is the core security step. It specifically checks for CRITICAL, HIGH, and MEDIUM severity vulnerabilities to ensure all published images meet a minimum security standard. |
| `4. Push Image to Docker Hub` | If the security scan passes, the workflow logs into Docker Hub using the stored secret (DOCKER_HUB_TOKEN) and pushes the newly built and validated images to the designated repository. | Deployment: Ensures only tested and scanned images are made publicly available for deployment. |

This automated process guarantees that developers can focus on writing code while the pipeline handles the necessary packaging, security checks, and distribution tasks.
