# Stage 1: Build the React application
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
# Using npm ci for clean, deterministic builds
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application for production
# Build args can be passed for environment variables if needed
ARG VITE_GEMINI_API_KEY
ARG VITE_OPENAI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY

RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.25-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Ensure correct permissions for nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Healthcheck to verify Nginx is serving traffic
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/health || exit 1

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]