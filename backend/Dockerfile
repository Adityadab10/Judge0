# Simple, works for dev & prod (command is overridden in compose for dev)
FROM node:20-alpine

WORKDIR /app

# Copy only manifests first for better caching
COPY package*.json ./

# Install all deps (dev or prod decided by NODE_ENV/command)
RUN npm install

# Copy the rest
COPY . .

# Configure port
ENV PORT=8080
EXPOSE 8080

# Default to production server
CMD ["npm", "start"]
