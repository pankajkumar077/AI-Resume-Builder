# 🚀 Enterprise Cloud-Native AI Resume Builder

## 📌 Project Overview
This repository contains a production-ready, cloud-native React application powered by AI (Gemini/OpenAI) for building ATS-friendly resumes. This project acts as a definitive showcase of **Senior Cloud & DevOps Architecture**, built identically to a real-world enterprise SaaS product.

---

## 🏗️ Production Architecture

The infrastructure is provisioned entirely using **Terraform** and follows a highly available, secure, and scalable AWS deployment model.

### **Traffic Flow:**
`Users` ➔ `Route53 (DNS)` ➔ `CloudFront (CDN + Caching)` ➔ `AWS WAF (Security)` ➔ `ALB (Load Balancer)` ➔ `ECS Fargate (Containers)` ➔ `S3 (Storage) / Secrets Manager`

### 1. Infrastructure as Code (Terraform)
All infrastructure resides in the `/terraform` directory, structured modularly:
- **`vpc.tf`**: Provisions a custom VPC with public and private subnets across multiple Availability Zones, ensuring network isolation. Includes NAT Gateways for private subnet outbound access.
- **`ecs.tf`**: Sets up the Amazon ECS Cluster utilizing AWS Fargate (Serverless compute), eliminating EC2 instance management overhead. Includes auto-scaling policies based on CPU utilization.
- **`alb.tf`**: Configures the Application Load Balancer to distribute traffic to ECS tasks, performing constant health checks on the `/health` endpoint.
- **`route53_acm.tf`**: Manages the custom domain (`airesumebuilder.dev`) and provisions free, auto-renewing SSL certificates via AWS ACM for strict HTTPS enforcement.
- **`waf.tf`**: Protects the application using AWS WAF. Includes rate limiting (mitigates DDoS) and the AWS Managed Core Rule Set to block SQLi, XSS, and bad bots.
- **`s3_cloudfront.tf`**: Amazon S3 is used to host static assets, fronted by CloudFront for edge caching, reducing latency globally. Origin Access Control (OAC) secures S3 from direct public access.
- **`iam.tf`**: Implements the principle of least privilege. Grants ECS tasks specific permissions to read API keys from AWS Secrets Manager and interact with S3.

### 2. Containerization (Docker)
- **Multi-Stage Build (`Dockerfile`):**
  - **Stage 1 (Builder):** Uses `node:20-alpine` to cleanly install dependencies and compile the React code.
  - **Stage 2 (Production):** Uses an ultra-lightweight `nginx:1.25-alpine` image. Removes all source code and build tools, drastically minimizing the attack surface.
- **Nginx Reverse Proxy (`nginx/nginx.conf`):**
  - Configures crucial security headers (`Strict-Transport-Security`, `X-Frame-Options`, `X-XSS-Protection`).
  - Enforces aggressive caching for static assets while enforcing no-cache on the entry `index.html`.
  - Enables GZIP compression to minimize payload size.

### 3. Enterprise CI/CD Pipeline (GitHub Actions)
The deployment is fully automated via `.github/workflows/deploy.yml`.

**Pipeline Stages:**
1. **`test-and-lint`**: Checks out the code, sets up Node.js, installs dependencies cleanly, and performs the production build.
2. **`terraform`**: Automatically provisions/updates the AWS infrastructure based on changes to `.tf` files. Uses S3 backend for remote state and DynamoDB for state locking.
3. **`deploy`**: Logs into AWS via IAM roles, builds the Docker image, tags it with the commit SHA, pushes it to AWS ECR, and forces an ECS deployment using the new task definition, guaranteeing **Zero-Downtime Deployments**.

### 4. Security Implementation
- **AWS Secrets Manager:** Sensitive AI API keys are stored securely in AWS Secrets Manager and injected dynamically into containers at runtime, completely avoiding `.env` leaks.
- **Network Security:** ECS tasks run in **Private Subnets**; they are inaccessible from the public internet and can only receive traffic from the ALB.
- **WAF:** Configured with rate-limiting and core security rules at the edge (CloudFront).

---

## 🛠️ Deployment Guide

### Prerequisites
1. **AWS Account** with administrative privileges.
2. **Terraform** CLI installed locally (v1.5+).
3. **GitHub Repository** with the following secrets configured:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `VITE_GEMINI_API_KEY`
   - `VITE_OPENAI_API_KEY`

### Local Testing
```bash
# Build and start the container locally
docker-compose up --build -d

# Verify health status
curl http://localhost:8080/health
```

### Manual Terraform Provisioning
If you prefer not to use the automated pipeline for the initial setup:
```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve
```

### CI/CD Deployment
Simply push your code to the `main` branch. GitHub Actions will handle the Terraform planning, container building, ECR pushing, and ECS deployment automatically.

---

*Architected and developed as a demonstration of Senior DevOps engineering capabilities, focusing on AWS native services, infrastructure as code, container orchestration, and highly available architectures.*