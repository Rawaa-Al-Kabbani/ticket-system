# Building the backend `GraphQL` api for Ticket system

A simple support ticket system. In this exercise, a `ticket` is defined as a task that has a `title`. The ticket is either `completed` or `incomplete` at any given time. It has a recursive structure, meaning that it may have `children` tickets. Those children tickets may further have children tickets of their own, and so on. For example:


```json5
{
  "title": "first ticket",
  "isCompleted": false,
  "children": [
    {
      "title": "second ticket",
      "isCompleted": true,
      "children": []
    },
    {
      "title": "third ticket",
      "isCompleted": false,
      "children": [
        {
          "title": "fourth ticket",
          "isCompleted": true,
          "children": [///...]
        }
      ]
    }
  ]
}
```

## Technical Notes

- The server is running with [nodemon](https://nodemon.io/), which will automatically restart for you when you modify and save a file.
- The database provider is [SQLite](https://www.sqlite.org/), which will store data in a local file called `database.sqlite3`.
- The database client is [Sequelize](https://sequelize.org/). For any database operation, you should only have to interact with `Sequelize`.
- You will be implementing a [GraphQL](https://graphql.org/) server. We have set up [Apollo Express Server](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express) and [GraphQL Playground](https://github.com/prisma/graphql-playground) for you.



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


