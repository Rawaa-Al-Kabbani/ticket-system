import { Op } from "sequelize";

/**
 * @typedef {Object} Pagination
 * @property {number} [offset] the pagination offset
 * @property {number} [limit] the pagination limit
 */

/**
 * @typedef {Object} Where
 * @property {number} [id] filter by the "ID" of the Ticket
 * @property {string} [title] filter by the "title" of the Ticket
 * @property {boolean} [isCompleted] filter by "isCompleted" on the Ticket
 */

export class TicketService {
  /**
   * @constructor
   * @param {TicketModel} model the injected TicketModel
   * @description The TicketModel is injected to simplify testing of the service by allowing us to inject a mocked model.
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Returns all Tickets matching the where conditions
   * @param {Where} [where] the where conditions object
   * @param {Pagination} [pagination] the pagination object
   * @returns {Ticket[]} the matching Tickets
   */
  findTickets(where, pagination) {
    return this.model.findAll({
      where,
      order: [["id", "ASC"]],
      offset: pagination?.offset,
      limit: pagination?.limit,
    });
  }

  /**
   * Returns the Ticket with the specified ID
   * @param {number} id the ID to find the Ticket by
   * @returns {Ticket} the Ticket with the specified ID
   */
  async getTicketById(id) {
    const ticket = await this.model.findByPk(id);
    if (!ticket) {
      throw new Error(`Ticket ${id} not found.`);
    }
    return ticket;
  }

  /**
   * Returns all the child Tickets for the Ticket
   * @param {number} id the ID of the Ticket to find the children for
   * @returns {Ticket[]} the child Tickets of the specified Ticket
   */
  getChildren(id) {
    return this.model.findAll({
      where: {
        parentId: id,
      },
    });
  }

  /**
   * Creates a new Ticket with the specified values
   * @param {Object} values the values for creating a new Ticket
   * @returns {Ticket} the newly created Ticket
   */
  createTicket(values) {
    try {
      return this.model.create(values);
    } catch (error) {
      throw new Error(`Failed to create Ticket: ${error.message}`);
    }
  }

  /**
   * Updates the Ticket with the specified ID with the specified values
   * @param {number} id the ID of the Ticket to update
   * @param {Object} values the values to update the Ticket with
   * @returns {Ticket} the updated Ticket
   */
  async updateTicket(id, values) {
    const instance = await this.getTicketById(id);
    try {
      instance.set(values);
      return instance.save();
    } catch (error) {
      throw new Error(`Failed to update Ticket: ${error.message}`);
    }
  }

  /**
   * Updates/toggles "isCompleted" on the the Ticket with the specified ID
   * @param {number} id the ID of the Ticket to toggle
   * @param {boolean} isCompleted the new status of the Ticket
   * @returns {Ticket} the updated Ticket
   */
  toggleTicket(id, isCompleted) {
    return this.updateTicket(id, {
      isCompleted,
    });
  }

  /**
   * Updates the parent Ticket of a Ticket
   * @param {number} childId the ID of the Ticket to update
   * @param {number} parentId the new parent ID for the Ticket
   * @returns {Ticket} the updated Ticket
   */
  async setParentOfTicket(childId, parentId) {
    if (childId === parentId) {
      throw new Error("A ticket can't be the parent to itself!");
    }
    const parent = await this.getTicketById(parentId);
    return this.updateTicket(childId, {
      parentId: parent.id,
    });
  }

  /**
   * Clears the parent ID of a Ticket
   * @param {number} id the ID of the Ticket to remove its parent ID
   * @returns {Ticket} the updated Ticket
   */
  async removeParentFromTicket(id) {
    return this.updateTicket(id, {
      parentId: null,
    });
  }

  /**
   * Removes a Ticket
   * @param {number} id the ID of the Ticket to remove
   * @returns {boolean} returns true if the Ticket was removed successfully, otherwise false
   */
  async removeTicketById(id) {
    const instance = await this.getTicketById(id);
    if (!instance) {
      return false;
    }
    // We have to clear the parentId of all the children before removing the Ticket.
    try {
      await this.model.update(
        {
          parentId: null,
        },
        {
          where: {
            parentId: id,
          },
        },
      );
      await instance.destroy();
    } catch (error) {
      throw new Error(`Failed to remove ticket: ${error.message}`);
    }

    return true;
  }

  /**
   * Adds child Tickets to the specified Ticket
   * @param {number} parentId the ID of the Ticket to add children to
   * @param {number[]} childrenIds the IDs of the children
   * @returns {Ticket} the updated parent Ticket
   */
  async addChildrenToTicket(parentId, childrenIds) {
    if (childrenIds.includes(parentId)) {
      throw new Error("A ticket can't be the parent to itself!");
    }

    const parentTicket = await this.model.findByPk(parentId);

    if (!parentTicket) {
      throw new Error("Parent ticket not found.");
    }

    const childrenTickets = await this.model.findAll({
      where: {
        id: { [Op.in]: childrenIds },
      },
    });

    if (childrenTickets.length !== childrenIds.length) {
      throw new Error("One or more invalid child IDs.");
    }

    try {
      await this.model.update(
        {
          parentId: parentId,
        },
        {
          where: {
            id: { [Op.in]: childrenIds },
          },
        },
      );
    } catch (error) {
      throw new Error(`Failed to update child tickets: ${error.message}`);
    }

    // Find and return the updated parent ticket
    return this.getTicketById(parentId);
  }

  getAllChildren(parentIds) {
    return this.model.findAll({
      where: {
        parentId: { [Op.in]: parentIds },
      },
    });
  }
}
