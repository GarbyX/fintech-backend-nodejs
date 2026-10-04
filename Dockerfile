FROM node:20-alpine

# Install system dependencies required by Prisma CLI on Alpine
RUN apk add --no-cache openssl libc6-compat ca-certificates

WORKDIR /app

# 1. Copy package manifests and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# 2. Install production dependencies
RUN npm ci --only=production

# 3. Copy application source code
COPY . .

# 4. Generate Prisma Client
RUN npx prisma generate

EXPOSE 5001

# 5. Run migrations and start the application server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]