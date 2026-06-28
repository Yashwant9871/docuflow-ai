FROM node:20-alpine

WORKDIR /app

# Copy lock files and packages
COPY package.json ./

# Install bun and use it to install lock dependencies if present,
# but we can also use npm to build cleanly.
RUN npm install --legacy-peer-deps

# Copy app source
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite dev server bound to host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
