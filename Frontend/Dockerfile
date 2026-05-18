# Use official lightweight Node image
FROM node:18-alpine

# Set container workspace
WORKDIR /app

# Copy package descriptors and install packages
COPY package*.json /app/
RUN npm install

# Copy all frontend source files
COPY . /app/

# Expose Vite development port
EXPOSE 5173

# Bind Vite to host 0.0.0.0 for external docker routing
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
