FROM node:20-alpine

WORKDIR /app

# Copy package files first (better caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Accept Vite API URL from docker-compose
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copy all source code
COPY . .

# Expose frontend port
EXPOSE 5173

# Run Vite in LAN mode
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
