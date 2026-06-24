# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use legacy-peer-deps to resolve conflicts)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build argument for API URL
ARG VITE_BASE_URL=http://localhost:5050
ENV VITE_BASE_URL=$VITE_BASE_URL

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy package files for production server
COPY package*.json ./
COPY server.js ./

# Install only express for production server
RUN npm install express --legacy-peer-deps

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 5173

# Start the server
CMD ["node", "server.js"]
