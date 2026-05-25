FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy local files
COPY . .

# Expose port and start app
EXPOSE 5000
CMD ["npm", "start"]
