ARG NODE_VERSION=23.5.0

# Step 1: Build (Build the application)
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /usr/src/app

# Copy package.json and package-lock.json from the root directory
COPY package.json package-lock.json ./

# Install dependencies (using --force because this is a build environment)
RUN npm ci --force

# Copy the remaining source code
COPY . .

# Run the build command for the nomas-colyseus application
# The output will be in /usr/src/app/dist/apps/nomas-colyseus/
RUN npx nest build nomas-colyseus

# Step 2: Production (Final image)
FROM node:${NODE_VERSION}-alpine AS production

# Default ports for Colyseus (2567) and the API you defined (3002)
EXPOSE 3002 2567

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
# Both are needed for npm install --production to work correctly
COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/package-lock.json ./

# Install only the production dependencies
# Set the destination directory to /usr/src/app (current WORKDIR)
RUN npm ci 

# Copy the build output from the builder
# Copy the build output from the builder to the current working directory (/)
COPY --from=build /usr/src/app/dist/apps/nomas-colyseus ./

# Run as a non-root user
# Use the default 'node' user of the Node-Alpine image
USER node

# Command to start the built application
# NestJS will create a startup file (usually main.js) after building
CMD ["node", "main.js"]