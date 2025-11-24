# In Dockerfile at Stage 2
FROM nginx:alpine
COPY --from=builder /app/dist/skote /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Update default.conf inside container to listen on 8081
# e.g., change `listen 80;` to `listen 8081;` inside nginx.conf

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
