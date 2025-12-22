# Use Node.js image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port
EXPOSE 5000

# Start the app (will generate Prisma client first)
CMD ["npx prisma generate && npm run dev"]
