import { getModels } from '../../utils/helpers.js';

export const getAllEvents = async (req, res, next) => {
  try {
    const { Event } = getModels(req.db);
    const events = await Event.find({ tenantId: req.tenantId }).populate('createdBy', 'fullName');
    res.status(200).json({ status: 'success', results: events.length, data: { events } });
  } catch (err) { next(err); }
};

export const createEvent = async (req, res, next) => {
  try {
    const { Event } = getModels(req.db);
    const { date, time, ...rest } = req.body;
    
    // Process eventDate
    let eventDate = date;
    if (date && time) {
      eventDate = new Date(`${date}T${time}`);
    } else if (date) {
      eventDate = new Date(date);
    }

    const event = await Event.create({ 
      ...rest, 
      eventDate,
      tenantId: req.tenantId,
      createdBy: req.user?._id
    });
    
    res.status(201).json({ status: 'success', data: { event } });
  } catch (err) { next(err); }
};
