# Ticket system

A ticket API written in Node.js, GraphQL, and SQLite

# How to run the service and the tests

## To run the service and the tests locally do the following:
 
1) Install the dependencies using `npm install`
2) Setup the database using `npm run setup`

To run the service in development mode, then:

1) Run `npm run watch`

## To run the service in production mode, then:

1) Run `npm run build`
2) Run `npm run start`

To run the tests:

1) Run `npm run test`

To run the service using Docker and docker-compose, simply run: `docker-compose up`.

Note: That the Docker image will create a new database within the image,
  so any changes made to the database in the Docker will not reflect in your local database, and vice-versa.
  If you want to share the same database locally and in the container, this can be solved by mounting a volume for the database.


