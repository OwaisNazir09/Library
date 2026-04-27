import userSchema from '../modules/user/user.model.js';
import bookSchema from '../modules/book/book.model.js';
import borrowingSchema from '../modules/borrowing/borrowing.model.js';
import tableSchema from '../modules/table/table.model.js';
import eventSchema from '../modules/event/event.model.js';
import notificationSchema from '../modules/notification/notification.model.js';
import fineSchema from '../modules/fines/fine.model.js';
import resourceSchema from '../modules/resource/resource.model.js';
import { accountSchema, transactionSchema, receiptSchema } from '../modules/ledger/finance.model.js';

import blogSchema from '../modules/blog/blog.model.js';
import commentSchema from '../modules/blog/comment.model.js';
import likeSchema from '../modules/blog/like.model.js';
import attendanceSchema from '../modules/attendance/attendance.model.js';
import quoteSchema from '../modules/quote/quote.model.js';
import tenantSchema from '../modules/tenant/tenant.model.js';

export const getModels = (connection) => {
  return {
    Tenant: connection.models.Tenant || connection.model('Tenant', tenantSchema),
    User: connection.models.User || connection.model('User', userSchema),
    Book: connection.models.Book || connection.model('Book', bookSchema),
    Borrowing: connection.models.Borrowing || connection.model('Borrowing', borrowingSchema),
    Table: connection.models.Table || connection.model('Table', tableSchema),
    Event: connection.models.Event || connection.model('Event', eventSchema),
    Notification: connection.models.Notification || connection.model('Notification', notificationSchema),
    Fine: connection.models.Fine || connection.model('Fine', fineSchema),
    Resource: connection.models.Resource || connection.model('Resource', resourceSchema),

    Blog: connection.models.Blog || connection.model('Blog', blogSchema),
    Comment: connection.models.Comment || connection.model('Comment', commentSchema),
    Like: connection.models.Like || connection.model('Like', likeSchema),
    Attendance: connection.models.Attendance || connection.model('Attendance', attendanceSchema),
    Quote: connection.models.Quote || connection.model('Quote', quoteSchema),

    Account: connection.models.Account || connection.model('Account', accountSchema),
    Transaction: connection.models.Transaction || connection.model('Transaction', transactionSchema),
    Receipt: connection.models.Receipt || connection.model('Receipt', receiptSchema),

    InternalAccount: connection.models.Account || connection.model('Account', accountSchema),
    StudentAccount: connection.models.Account || connection.model('Account', accountSchema),
  };
};
