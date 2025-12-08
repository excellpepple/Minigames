# Build frontend
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run backend + serve frontend
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production

# Copy backend merged server
COPY src/backend ./src/backend

# Copy frontend build
COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["node", "src/backend/server.js"]
