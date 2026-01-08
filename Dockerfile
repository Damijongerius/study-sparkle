# syntax=docker/dockerfile:1
FROM node:18-alpine AS builder
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Install deps
COPY package*.json ./
RUN npm ci --silent

# Copy source, run tests (if any) and build
COPY . .
RUN npm test --if-present --silent
RUN npm run build --silent

# Production image serving static build with nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
