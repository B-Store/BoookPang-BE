# Base image
FROM node:18.20.4-alpine

# # Create app directory
RUN mkdir -p /var/app
WORKDIR /var/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app source
COPY . .

# Build the app
RUN npm run build

# Expose ports for both applications
EXPOSE 9000

# Start Elasticsearch and NestJS
CMD ["node", "dist/src/main.js"]
