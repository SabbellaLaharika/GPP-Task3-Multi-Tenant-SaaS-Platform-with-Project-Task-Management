# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Production stage - Extreme size reduction
FROM alpine:3.18

# Install only the nodejs runtime (no npm, no extra tools)
RUN apk add --no-cache nodejs

WORKDIR /app

# Copy production node_modules and assets from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/migrations ./migrations
COPY --from=build /app/seeders ./seeders
COPY --from=build /app/openapi.yml ./openapi.yml
COPY --from=build /app/entrypoint.sh ./entrypoint.sh

# Expose port
EXPOSE 5000

# Start application using entrypoint
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]