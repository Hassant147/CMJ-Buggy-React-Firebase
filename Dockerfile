# Use Node.js as the base image
FROM node:20-alpine as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire application to the working directory
COPY . .

# Copy the firebase.js file from src directory to the working directory
COPY ./src/firebase.js /app/src/firebase.js

# Build the React app for production
RUN npm run build

# Start a new stage to serve the built React app
FROM node:20-alpine

# Set the working directory for the final image
WORKDIR /app

# Copy the built React app from the previous stage
COPY --from=build /app/build ./build

# Copy the firebase.js file from the build stage
COPY --from=build /app/src/firebase.js ./src/firebase.js

# Install a simple server to serve the static files
RUN npm install -g serve

# Expose port 3000 (adjust this if your app uses a different port)
EXPOSE 3000

# Command to start the server serving the React app
CMD ["serve", "-s", "build"]
