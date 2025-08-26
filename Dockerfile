# Simple Dockerfile to run Angular development server

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies using yarn (which handles the dependencies better)
RUN yarn install

# Copy source code
COPY . .

# Expose port 4200 (Angular dev server default)
EXPOSE 4200

# Start the development server on all interfaces
CMD ["yarn", "start", "--host", "0.0.0.0"]
