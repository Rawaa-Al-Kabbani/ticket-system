import { TicketService } from "./ticket.service";
import SequelizeMock from "sequelize-mock";

const TICKETS = [
  {
    id: 1,
    parentId: null,
    title: "Foo",
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    parentId: null,
    title: "Bar",
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    parentId: null,
    title: "Baz",
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    parentId: 1,
    title: "Qux",
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    parentId: 1,
    title: "Frang",
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    parentId: 1,
    title: "Zooby",
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const dbConnection = new SequelizeMock();

describe("Test TicketService", () => {
  let ticketService;

  beforeEach(() => {
    const TicketMock = dbConnection.define("tickets");
    TicketMock.$queueResult(TICKETS.map((ticket) => TicketMock.build(ticket)));

    // sequelize-mock does not support 'findByPk', so we have to mock the 'findByPk' function here.
    TicketMock.findByPk = async (id, options) => {
      const result = await TicketMock.findAll({
        where: {
          id: id,
        },
        ...options,
      });
      return result?.[0] ?? null;
    };

    ticketService = new TicketService(TicketMock);
  });

  afterEach(() => {
    ticketService = null;
  });

  describe("Test #createTicket", () => {
    it("should create a new Ticket", async () => {
      const values = {
        title: "Turtle",
        isCompleted: false,
        parentId: null,
      };
      const result = await ticketService.createTicket(values);
      expect(result).toMatchObject(values);
    });
  });

  describe("Test #updateTicket", () => {
    it("should update a Ticket", async () => {
      const ticket = TICKETS[0];
      const values = {
        title: "New title",
      };
      const result = await ticketService.updateTicket(ticket.id, values);
      expect(result).toMatchObject({
        ...ticket,
        ...values,
      });
    });
  });
});
