import { ApolloServer, gql } from "apollo-server-express";
import DataLoader from "dataloader";
import express from "express";
import { models } from "./db/models";
import { TicketService } from "./services/ticket.service";

const PORT = 4001;

const typeDefs = gql`
  type Ticket {
    id: ID!
    title: String!
    isCompleted: Boolean!
    children: [Ticket]!
  }

  input WhereTicketInput {
    id: ID
    title: String
    isCompleted: Boolean
    parentId: ID
  }

  input UpdateTicketInput {
    title: String
    isCompleted: Boolean
  }

  input PaginationInput {
    offset: Int
    limit: Int
  }

  type Query {
    # query a list of all tickets matching the filter.
    tickets(where: WhereTicketInput, pagination: PaginationInput): [Ticket]!

    # return the ticket with the given id
    ticket(id: ID!): Ticket!
  }

  type Mutation {
    # create a ticket with the given params
    createTicket(title: String!, isCompleted: Boolean): Ticket!

    # update ticket.title and ticket.isCompleted of the ticket with the given id
    updateTicket(id: ID!, data: UpdateTicketInput!): Ticket!

    # update ticket.isCompleted as given
    toggleTicket(id: ID!, isCompleted: Boolean!): Ticket!

    # delete this ticket
    removeTicket(id: ID!): Boolean!

    # every children in childrenIds gets their parent set as parentId
    addChildrenToTicket(parentId: ID!, childrenIds: [ID!]!): Ticket!

    # the ticket with id: childId gets the ticket with id: parentId as its new parent
    setParentOfTicket(parentId: ID!, childId: ID!): Ticket!

    # the ticket with the given id becomes a root level ticket
    removeParentFromTicket(id: ID!): Ticket!
  }
`;

const ticketService = new TicketService(models.Ticket);

const childrenLoader = new DataLoader(async (parentIds) => {
  // Get all children
  const allChildren = await ticketService.getAllChildren(parentIds);
  const result = parentIds.map((parentId) =>
    allChildren.filter((child) => child.parentId === parentId),
  );
  return Promise.resolve(result);
});

const resolvers = {
  Query: {
    tickets: (_root, args) => {
      return ticketService.findTickets(args.where, args.pagination);
    },
    // Query for getting a Ticket by ID.
    ticket: (_root, args) => {
      return ticketService.getTicketById(args.id);
    },
  },
  Ticket: {
    // Nested resolver for querying child Tickets.
    children: (root) => {
      return childrenLoader.load(root.id); // starts a timer, 200ms,
    },
  },
  Mutation: {
    // Mutation for creating a new ticket with the specified "title" and "isCompleted" values
    createTicket: (_root, args) => {
      return ticketService.createTicket({
        title: args.title,
        isCompleted: args.isCompleted,
      });
    },
    // Mutation for updating a Ticket with the specified values
    updateTicket: (_root, args) => {
      return ticketService.updateTicket(args.id, args.data);
    },
    // Mutation for updating/toggling "isCompleted" on the specified Ticket
    toggleTicket: (_root, args) => {
      return ticketService.toggleTicket(args.id, args.isCompleted);
    },
    // Mutation for removing a Ticket by ID.
    removeTicket: (_root, args) => {
      return ticketService.removeTicketById(args.id);
    },
    // Mutation for adding child Tickets to the specified Ticket.
    addChildrenToTicket: (_root, args) => {
      return ticketService.addChildrenToTicket(args.parentId, args.childrenIds);
    },
    // Mutation for setting the parent Ticket of a Ticket.
    setParentOfTicket: (_root, args) => {
      return ticketService.setParentOfTicket(args.childId, args.parentId);
    },
    // Mutation for clearing the parentId of a Ticket.
    removeParentFromTicket: (_root, args) => {
      return ticketService.removeParentFromTicket(args.id);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.start().then(() => {
  const app = express();
  server.applyMiddleware({ app });

  app.listen({ port: PORT }, () => {
    console.log(
      `Server ready at: http://localhost:${PORT}${server.graphqlPath}`,
    );
  });
});
