FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

# Copy application source code
COPY . .

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]