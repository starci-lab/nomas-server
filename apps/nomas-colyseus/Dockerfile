FROM node:23-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build with production environment
ENV NODE_ENV=production
RUN npm run build:prod:nomas-colyseus

# Production stage
FROM node:23-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies + cross-env (needed for start:prod script)
RUN npm ci --only=production && \
    npm install cross-env --save-prod && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Set production environment
ENV NODE_ENV=production

EXPOSE 3000

# Start application using npm script from package.json
CMD ["npm", "run", "start:prod:nomas-colyseus"]

