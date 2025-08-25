# --------- Build Stage ---------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
# prod build (Angular 18 ok on Node 20)
RUN npm run build -- --configuration=production

# --------- Runtime Stage ---------
FROM nginx:alpine
# (optional) custom SPA config:
# COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# 👇 IMPORTANT: copy the *contents* of dist/skote/ to nginx html root
COPY --from=build /app/dist/skote/ /usr/share/nginx/html/

EXPOSE 8081
CMD ["nginx","-g","daemon off;"]
