# Use a plain Node image
FROM node:18.18.0

WORKDIR /app

# Copy all the project files into /app directory
COPY . .

# Install the dependencies (ci ignores dev-dependencies)
RUN npm ci

# Build the distribution files using Babel
RUN npm run build

# Setup the database
RUN npm run setup

# Start the server
CMD [ "npm", "run", "start" ]
