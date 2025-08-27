# Stage 1: Build Angular app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build --configuration production

# Stage 2: Serve Angular with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist/skote /usr/share/nginx/html
# Custom nginx config to handle Angular routes
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8081
CMD ["nginx", "-g", "daemon off;"]



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
