# ---------- build stage ----------
FROM node:18-slim AS builder
WORKDIR /app

# 1) Copy only manifests first (better caching)
COPY package.json package-lock.json ./

# 2) Hard-fail if lockfile missing or mismatched
# npm ci fails automatically when package-lock.json is out of sync with package.json
# (documented behaviour)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# 3) Copy source and build
COPY . .
# If Angular:
# RUN npm run build -- --configuration=production
# If React/Vite:
# RUN npm run build
RUN npm run build

# ---------- runtime stage ----------
FROM nginx:1.27-alpine AS runtime
# Angular/React builds usually output to /app/dist/<app-name> or /app/build
# COPY --from=builder /app/dist /usr/share/nginx/html
# Adjust the path below to your build output folder:
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: custom nginx.conf (else default static serving works)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8081
CMD ["nginx", "-g", "daemon off;"]
