import { getModels } from '../../utils/helpers.js';
import { deleteCloudinaryImage } from '../../middleware/upload.middleware.js';

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

    let eventDate = date;
    if (date && time) {
      eventDate = new Date(`${date}T${time}`);
    } else if (date) {
      eventDate = new Date(date);
    }

    const eventData = {
      ...rest,
      eventDate,
      tenantId: req.tenantId,
      createdBy: req.user?._id
    };

    if (req.file) {
      eventData.bannerImage = req.file.path;
      eventData.bannerImagePublicId = req.file.filename;
    }

    const event = await Event.create(eventData);
    res.status(201).json({ status: 'success', data: { event } });
  } catch (err) { next(err); }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { Event } = getModels(req.db);
    const event = await Event.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });

    if (!event) {
      const error = new Error('No event found with that ID');
      error.statusCode = 404;
      throw error;
    }

    if (event.bannerImagePublicId) {
      await deleteCloudinaryImage(event.bannerImagePublicId);
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
};
