FROM node:23-alpine AS builder

#  Step 1: Builder
WORKDIR /app

# Copy package.json and package-lock.json from the root directory (important for npm ci)
# This assumes the build context is the root directory of the repository.
COPY package.json package-lock.json ./

# Copy the configuration files of the sub-application from the relative path
COPY apps/nomas-colyseus/nest-cli.json ./
COPY apps/nomas-colyseus/tsconfig*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy the entire source code of the project
COPY . .

# Run the build command for the nomas-colyseus application
ENV NODE_ENV=production
RUN npm run build:prod:nomas-colyseus

# Step 2: Production (Final image, small and light)
FROM node:23-alpine

WORKDIR /app

# Copy package.json and package-lock.json (only for production deps)
COPY package.json package-lock.json ./

# Install the dependencies for the production environment and the necessary packages
RUN npm ci --only=production && \
    npm install cross-env --save-prod && \
    npm cache clean --force

# Copy the built application (dist) from the builder step
COPY --from=builder /app/dist ./dist

# Create a non-root user (not root) to enhance security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

# Switch to the non-root user
USER nodejs

# Set the production environment
ENV NODE_ENV=production

# Open the port for the Colyseus application
EXPOSE 3002 2567


# Command to start the application
CMD ["npm", "run", "start:prod:nomas-colyseus"]