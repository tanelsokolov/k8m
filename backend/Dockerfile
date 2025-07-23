FROM node:lts-alpine3.21
WORKDIR /app

# Install system dependencies for systeminformation
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    linux-headers \
    curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Create logs directory
RUN mkdir -p logs

# Copy source code
COPY server.js ./

# Set proper permissions for logs directory
RUN chown -R node:node logs

# Switch to non-root user
USER node

EXPOSE 3000

# Health check using the detailed endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
