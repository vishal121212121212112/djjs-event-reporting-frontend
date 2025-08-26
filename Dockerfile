# Stage 1: Build Angular app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build --configuration production

# Stage 2: Serve Angular with http-server
FROM node:20-alpine
WORKDIR /app
RUN npm install -g http-server
COPY --from=builder /app/dist/skote ./dist
EXPOSE 4200
CMD ["http-server", "dist", "-p", "4200", "-d", "false", "-c-1"]




# Simple Dockerfile to run Angular development server

# FROM node:18-alpine

# # Set working directory
# WORKDIR /app

# # Copy package files
# COPY package*.json yarn.lock ./

# # Install dependencies using yarn (which handles the dependencies better)
# RUN yarn install

# # Copy source code
# COPY . .

# # Expose port 4200 (Angular dev server default)
# EXPOSE 4200

# # Start the development server on all interfaces
# CMD ["yarn", "start", "--host", "0.0.0.0"]
