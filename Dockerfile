FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built server bundle (built via `npm run build`)
COPY dist/server.cjs ./dist/server.cjs

# Expose Cloud Run's expected port
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/server.cjs"]
