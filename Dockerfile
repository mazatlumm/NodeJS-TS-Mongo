FROM node:17

#Working Dir
WORKDIR /usr/src/app

# Copy Package Json Files
COPY package*.json ./

#Install Prettier (For Our Package's build function)
RUN npm install prettier -g

# Install Files
RUN npm install

# Copy source Files
COPY .  .

# Build
RUN npm run build

# Expose the APi Port
EXPOSE 3000

CMD ["node", "build/server.js"]