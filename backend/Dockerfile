# Use Node 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Health check
# Copy entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Start application using entrypoint
ENTRYPOINT ["./entrypoint.sh"]