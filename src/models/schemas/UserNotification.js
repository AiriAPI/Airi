import mongoose from 'mongoose';

/**
 * Represents the schema for the User model.
 * @class UserSchema
 */
const UserNotificationSchema = new mongoose.Schema({
  _id: String,
  userId: { type: String, required: true, index: true }, // Index for fast lookup
  type: { type: String, required: true, enum: ['info', 'warning', 'error', 'success'] }, // Predefined types for efficiency
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  expiry: Date, // Auto-delete expired notifications
  read: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
});

/**
 * User model for interacting with the 'Users' collection in MongoDB.
 * @class User
 * @type {mongoose.Model<UserSchema>}
 */
const UserNotification = mongoose.model('UserNotification', UserNotificationSchema);

export default UserNotification;
