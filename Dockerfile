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
RUN npm run build
RUN npm prune --production

# Stage 2: Run the app with Node.js
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache wget

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/health >/dev/null || exit 1

CMD ["node", "server.js"]