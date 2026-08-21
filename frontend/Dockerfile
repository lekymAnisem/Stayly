# ---- Build stage ----
FROM node:22-alpine AS build
ARG VITE_CLERK_PUBLISHABLE_KEY=""
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runtime stage: static files + reverse proxy (non-root) ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /etc/nginx/conf.d /var/run/nginx.pid
USER nginx
EXPOSE 8080