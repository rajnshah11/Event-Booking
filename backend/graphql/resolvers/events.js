const { dateToString } = require("../../helpers/date.js");
const Event = require("../../models/event.js");
const User = require("../../models/user.js");
const { transformEvent } = require("./merge");

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => transformEvent(event));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },


  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("User is not authorized to create event");
    }
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: dateToString(args.eventInput.date),
      creator: req.userId
    });

    let createdEvent;

    try {
      const result = await event.save();
      createdEvent = transformEvent(result);
      const creator = await User.findById(req.userId);

      if (!creator) {
        throw new Error("User not found.");
      }
      
      creator.createdEvents.push(event);
      await creator.save();

      return createdEvent;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
};