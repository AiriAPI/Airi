import mongoose from 'mongoose';

/**
 * Represents the schema for the User model.
 * @class UserSchema
 */
const UserSchema = new mongoose.Schema({
  /**
   * Unique identifier for the user.
   * @type {string}
   */
  _id: { type: String },

  /**
   * User's email address.
   * @type {string}
   * @required
   */
  email: { type: String, required: true },

  /**
   * User's hashed password.
   * @type {string}
   * @required
   */
  password: { type: String, required: true },

  /**
   * User's Discord access token
   * @type {string}
   */
  access_token: { type: String },

  /**
   * Authentication token for the user.
   * @type {string}
   */
  token: { type: String },

  /**
   * Flag indicating whether the user is banned.
   * @type {boolean}
   * @default false
   */
  banned: { type: Boolean, default: false },

  /**
   * Array to store the history of status changes with timestamp, reason, and ban/unban flag.
   * @type {Array<{ timestamp: Date, reason: string, isBanned: boolean }>}
   */
  status_history: [
    {
      /**
       * Unique identifier for the status change.
       * @type {string}
       * @required
       */
      _id: String,
      /**
       * Timestamp of the status change.
       * @type {Date}
       * @default Date.now
       */
      timestamp: { type: Date, default: Date.now },

      /**
       * Expiry date for the status change.
       * @type {Date}
       * @default Date.now
       */
      expiry: { type: Date },

      /**
       * The reason for the status change.
       * @type {string}
       */
      reason: { type: String },

      /**
       * The value of the status change either quota or role or subscription or new email.
       * @type {string}
       * @default 'null'
       */
      value: { type: String },
      /**
       * Flag indicating whether the user is banned at this status change.
       * @type {boolean}
       */
      isBanned: { type: Boolean },

      /**
       * Information about the staff member who performed the action.
       * @type {Object}
       * @required
       */
      executor: String,
    },
  ],

  /**
   * User's request quota.
   * @type {number}
   * @default 500
   */
  req_quota: { type: Number, required: true, default: 500 },

  /**
   * Number of requests made by the user.
   * @type {number}
   * @default 0
   */
  req_count: { type: Number, default: 0 },

  /**
   * Number of requests consumed by the user.
   * @type {number}
   * @default 0
   */
  req_consumed: { type: Number, default: 0 },

  /**
   * Date and time when the user account was created.
   * @type {Date}
   * @default Date.now
   */
  createdAt: {
    type: Date,
    default: () => Date.now(), // Use a function to get the current date
  },

  /**
   * Request rate limit for the user.
   * @type {number}
   * @default 20
   */
  rateLimit: { type: Number, default: 20 },

  /**
   * Array of roles assigned to the user.
   * @type {Array<string>}
   * @default ['user']
   */
  roles: { type: [String], default: ['user'] },

  /**
   * Subscription or plan type.
   * @type {string}
   */
  planType: { type: String, default: 'free' },

  /**
   * Subscription start date.
   * @type {Date}
   */
  subscriptionStart: { type: Date },

  /**
   * Subscription end date.
   * @type {Date}
   */
  subscriptionEnd: { type: Date },

  /**
   * Subscription status.
   * @type {string}
   * @enum ['active', 'expired', 'canceled', 'pending', 'suspended', 'trial', 'renewal due', 'grace period']
   * @default 'active'
   */
  subscriptionStatus: {
    type: String,
    enum: ['active', 'expired', 'canceled', 'pending', 'suspended', 'trial', 'renewal due', 'grace period'],
    default: 'trial',
  },

  /**
   * Metadata for subscription.
   * @type {object}
   */
  subscriptionMetadata: { type: Object },

  /**
   * Object to store the count of requests made to each endpoint by the user.
   * @type {Object}
   */
  statistics: {
    requests: {
      type: Map,
      of: Number,
      default: {},
    },
  },
});

/**
 * User model for interacting with the 'Users' collection in MongoDB.
 * @class User
 * @type {mongoose.Model<UserSchema>}
 */
const User = mongoose.model('User', UserSchema);

export default User;
