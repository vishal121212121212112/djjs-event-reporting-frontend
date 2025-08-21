# ====== 1) BUILD STAGE: Angular build in Node ======
FROM node:18-alpine AS builder
WORKDIR /app

# Faster, reproducible installs
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
# package.json me "build": "ng build --configuration production" honi chahiye
RUN npm run build

# ====== 2) RUNTIME STAGE: NGINX on port 8081 ======
FROM nginx:stable-alpine

# --- Build-time args to select dist path (Angular 17+ vs <=16) ---
# APP_NAME: angular.json -> projects.<name>
# DIST_SUBDIR: Angular 17+ = browser ; Angular <=16 = .
ARG APP_NAME=your-app-name
ARG DIST_SUBDIR=browser

# Minimal SPA-friendly NGINX config on port 8081
RUN rm -f /etc/nginx/conf.d/default.conf && \
    printf 'server {\n\
  listen 8081;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  # Cache static assets (optional)\n\
  location ~* \\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$ { try_files $uri =404; access_log off; expires 30d; }\n\
  # SPA fallback: client-side routing ko support kare\n\
  location / { try_files $uri $uri/ /index.html; }\n\
}\n' > /etc/nginx/conf.d/default.conf

# --- Copy built files from builder stage ---
# Angular 17+: /app/dist/<APP_NAME>/browser/
# Angular <=16: /app/dist/<APP_NAME>/
# (<=16 ke liye build karte waqt DIST_SUBDIR="." pass karna)
COPY --from=builder /app/dist/${APP_NAME}/${DIST_SUBDIR}/ /usr/share/nginx/html/

EXPOSE 8081
CMD ["nginx", "-g", "daemon off;"]
