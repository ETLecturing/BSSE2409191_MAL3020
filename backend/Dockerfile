# Stage 1 — Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

# Stage 2 — Runner
FROM node:20-alpine
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables inside Docker
ENV PORT=5000
EXPOSE 5000

# Run backend in production mode
CMD ["node", "src/index.js"]
