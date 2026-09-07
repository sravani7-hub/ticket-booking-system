# --- Ticket Booking System: Backend (Node.js + Express) ---
# Place this file at: server/Dockerfile

FROM node:20-alpine

WORKDIR /app

# Install deps first (layer caching — only reinstalls when package*.json changes)
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the backend source
COPY . .

# Matches PORT in server/.env.example
EXPOSE 5000

# Basic container health check hitting your API
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/ || exit 1

CMD ["npm", "start"]
