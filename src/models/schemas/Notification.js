import mongoose from 'mongoose';

/**
 * Represents the schema for the User model.
 * @class UserSchema
 */
const NotificationSchema = new mongoose.Schema({
  _id: String,
  userId: { type: String, required: true, index: true }, // Index for fast lookup
  type: { type: String, required: true, enum: ['info', 'warning', 'error', 'success'] }, // Predefined types for efficiency
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  expiry: Date, // Auto-delete expired notifications
});

/**
 * User model for interacting with the 'Users' collection in MongoDB.
 * @class User
 * @type {mongoose.Model<UserSchema>}
 */
const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
