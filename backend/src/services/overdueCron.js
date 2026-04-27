import mongoose from 'mongoose';
import { getModels } from '../utils/helpers.js';
import WhatsAppService from './whatsapp.service.js';
import logger from '../utils/logger.js';

export const checkOverdueBorrowings = async () => {
    try {
        logger.info('Running overdue borrowings WhatsApp notification check...');
        const { Borrowing, User, Book } = getModels(mongoose.connection);

        const today = new Date();

        const overdueBorrowings = await Borrowing.find({
            status: { $in: ['borrowed', 'overdue'] },
            dueDate: { $lt: today },
            returnedDate: { $exists: false }
        }).populate('user book');

        logger.info(`Found ${overdueBorrowings.length} overdue borrowings.`);

        for (const borrowing of overdueBorrowings) {
            const user = borrowing.user;
            const book = borrowing.book;

            if (!user || !user.phone) continue;

            if (borrowing.status !== 'overdue') {
                borrowing.status = 'overdue';
                await borrowing.save();
            }

            const message = `📚 *Library Overdue Notice* 📚\n\nDear ${user.fullName || 'Member'},\n\nThe book *"${book?.title}"* was due on ${borrowing.dueDate.toLocaleDateString()}.\n\nPlease return it as soon as possible to avoid further fines.\n\nThank you!`;

            const sent = await WhatsAppService.sendMessage(borrowing.tenantId, user.phone, message);
            if (sent) {
                logger.info(`Overdue WhatsApp sent to ${user.phone} for book: ${book?.title}`);
            }
        }
    } catch (error) {
        logger.error('Error in overdue borrowings cron:', error);
    }
};
