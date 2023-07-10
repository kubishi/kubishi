# Use an official Node runtime as the base image
FROM node:14.21.3
ARG REACT_APP_FACEBOOK_APP_ID

# Set the working directory in the container to /app
WORKDIR /app

# Copy the package.json and package-lock.json to your app directory
COPY package*.json ./

# Install all the dependencies
RUN npm install

# Bundle your app's source inside the Docker image
COPY . .

# TODO: Had to build locally, should see why this breaks when building in Dockerfile
#       Problem is with facebook login feature
# Build the app
RUN npm run build

# Serve the app using node server.js
CMD ["npm", "run", "start"]
