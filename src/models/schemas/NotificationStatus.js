import mongoose from 'mongoose';

/**
 * Represents the schema for the User model.
 * @class UserSchema
 */
const NotificationStatusSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  read: { type: [String], default: [] }, // Auto-delete expired notifications
  deleted: { type: [String], default: [] },
});

/**
 * User model for interacting with the 'Users' collection in MongoDB.
 * @class User
 * @type {mongoose.Model<UserSchema>}
 */
const NotificationStatus = mongoose.model('NotificationStatus', NotificationStatusSchema);

export default NotificationStatus;
