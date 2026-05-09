# 🚀 Enterprise Cloud-Native AI Resume Builder

## 📌 Project Overview
This repository contains a production-ready, cloud-native React application powered by AI (Gemini/OpenAI) for building ATS-friendly resumes. The project has been completely overhauled with industry-standard **DevOps and Cloud Engineering** best practices, making it highly scalable, secure, and automated.

---

## 🏗️ Cloud & DevOps Architecture

### 1. Dockerization & Containerization
- **Multi-Stage Builds:** The application utilizes a multi-stage `Dockerfile` to dramatically reduce the final image size and enhance security.
  - **Stage 1 (Builder):** Uses `node:20-alpine` to cleanly install dependencies and compile the React/Vite source code.
  - **Stage 2 (Production):** Uses an ultra-lightweight `nginx:alpine` image to serve the compiled static files.
- **Docker Compose:** A `docker-compose.yml` file is provided for local deployment simulation, complete with health checks and network isolation.

### 2. AWS Infrastructure Deployment
The project is designed to be deployed on **AWS Elastic Container Service (ECS) with AWS Fargate** for serverless container management.

- **Amazon ECR (Elastic Container Registry):** securely stores the versioned Docker images.
- **Amazon ECS (Fargate):** Runs the frontend application securely without managing underlying EC2 instances.
- **Application Load Balancer (ALB):** Distributes incoming traffic across multiple Fargate tasks.
- **Amazon CloudFront & S3 (Optional Alternative):** The architecture also supports hosting the static build artifacts directly on S3 and serving via CloudFront CDN for global edge-caching.
- **Route53:** Manages DNS routing to the ALB or CloudFront distribution.

### 3. CI/CD Pipeline (GitHub Actions)
A robust Continuous Integration and Continuous Deployment (CI/CD) pipeline is configured in `.github/workflows/deploy.yml`.

**Pipeline Flow:**
1. **Trigger:** Code pushed to `main` branch.
2. **Code Quality:** Provisions a Node.js environment, installs dependencies cleanly (`npm ci`), and prepares for testing/linting.
3. **Build:** Compiles the application, securely injecting AI API keys via GitHub Secrets.
4. **Authenticate:** Securely logs into AWS using IAM Least Privilege roles via `aws-actions/configure-aws-credentials`.
5. **Container Registry:** Builds the Docker image, tags it with the Git commit SHA, and pushes it to AWS ECR.
6. **Task Definition Update:** Dynamically updates the ECS task definition with the newly built ECR image.
7. **Zero-Downtime Deployment:** Deploys the updated task to the ECS Cluster, waiting for stability to ensure zero downtime.

### 4. Security & Optimization
- **Nginx Reverse Proxy (`nginx.conf`):**
  - **Security Headers:** Implements `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security` (HSTS), and `Referrer-Policy`.
  - **Hidden Files Protection:** Blocks access to `.env` and `.git` files.
- **Gzip Compression:** enabled for text, CSS, JS, and JSON files to drastically reduce payload sizes and improve load times.
- **Caching Strategy:**
  - Static assets (images, CSS, JS) are cached aggressively (1 year) with `immutable` tags.
  - `index.html` is strictly prevented from caching (`no-store`, `no-cache`) to ensure users instantly receive updates when a new deployment occurs.
- **Secret Management:** Sensitive AI keys are managed via GitHub Secrets and injected only at build time. No secrets are committed to the repository.

### 5. Monitoring & Logging
- **Health Checks:** A dedicated `/health` endpoint is configured in Nginx to allow AWS ALB to monitor container health and automatically replace failing instances.
- **AWS CloudWatch:** ECS tasks are configured to stream logs directly to CloudWatch log groups (`/ecs/ai-resume-app`) for centralized monitoring and alerting.

---

## 🛠️ How to Deploy

### Local Testing
```bash
# Build and start the container locally
docker-compose up --build -d

# Verify health status
docker ps
```

### AWS Setup Prerequisites
1. **Create an ECR Repository** named `ai-resume-builder`.
2. **Create an ECS Cluster** and a Fargate Service.
3. **Configure GitHub Secrets:**
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `VITE_GEMINI_API_KEY`
   - `VITE_OPENAI_API_KEY`
4. Push to the `main` branch to trigger the automated deployment.

---

*This architecture demonstrates a deep understanding of container orchestration, automated delivery, web security, and cloud-native design principles.*