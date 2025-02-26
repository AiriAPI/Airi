import Notification from '../../../models/schemas/Notification.js';
import UserNotification from '../../../models/schemas/UserNotification.js';
import NotificationStatus from '../../../models/schemas/NotificationStatus.js';

/**
 * Fetches all notifications (user-specific and global), sorted by latest date.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const retrieveNotifications = async (req, res) => {
  try {
    const userId = req.headers.uid; // Assuming user ID is available in req.headers

    // Fetch user-specific notifications (excluding deleted ones)
    const userNotifications = await UserNotification.find({ userId, deleted: false }).lean();

    // Fetch global notifications
    const globalNotifications = await Notification.find().lean();

    // Fetch the user's read & deleted notifications status
    const notificationStatus = await NotificationStatus.findOne({ _id: userId }).lean();
    const readNotifications = notificationStatus?.read || [];
    const deletedNotifications = notificationStatus?.deleted || []; // Ensure correct field spelling

    // Filter out globally deleted notifications
    const filteredGlobalNotifications = globalNotifications
      .filter(notif => !deletedNotifications.includes(notif._id))
      .map(notif => ({
        ...notif,
        read: readNotifications.includes(notif._id), // True if read, false otherwise
      }));

    // Combine both types of notifications
    const allNotifications = [...userNotifications, ...filteredGlobalNotifications];

    // Sort notifications by timestamp (latest first)
    allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json({ notifications: allNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Marks a notification as read for the user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.body; // isGlobal: true for global notifications
    const userId = req.headers.uid;

    if (!id) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    const isGlobal = id.startsWith('G');

    if (isGlobal) {
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      // Check if the global notification exists
      const notificationExists = await Notification.exists({ _id: id });
      if (!notificationExists) {
        return res.status(404).json({ message: 'Global notification not found' });
      }

      // Update read status for global notifications in NotificationStatus
      await NotificationStatus.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { read: id } }, // Add without duplicates
        { upsert: true, new: true },
      );
    } else {
      // Update read status for user-specific notifications
      await UserNotification.findOneAndUpdate({ _id: id }, { read: true });
    }

    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Marks a notification as deleted for the user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const markNotificationAsDeleted = async (req, res) => {
  try {
    const { id } = req.body; // isGlobal: true for global notifications
    const userId = req.headers.uid;

    if (!id) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    const isGlobal = id.startsWith('G');

    if (isGlobal) {
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      // Check if the global notification exists
      const notificationExists = await Notification.exists({ _id: id });
      if (!notificationExists) {
        return res.status(404).json({ message: 'Global notification not found' });
      }

      // Update deleted status for global notifications in NotificationStatus
      await NotificationStatus.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { deleted: id } }, // Add without duplicates
        { upsert: true, new: true },
      );
    } else {
      // Update deleted status for user-specific notifications
      await UserNotification.findOneAndUpdate({ _id: id }, { deleted: true });
    }

    return res.status(200).json({ message: 'Notification marked as deleted' });
  } catch (error) {
    console.error('Error marking notification as deleted:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export { retrieveNotifications, markNotificationAsRead, markNotificationAsDeleted };
