import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const roles = [
  'developer',
  'super_admin',
  'admin',
  'database_moderator',
  'discord_moderator',
  'moderator',
  'community_manager',
  'support',
  'contributor',
  'tester',
  'beta_tester',
  'alpha_tester',
  'translator',
  'sponsor',
  'member',
  'user',
  'guest',
];

const SystemSchema = new Schema({
  _id: String,
  membership: {
    features: [],
    plans: [
      {
        _id: String,
        name: { type: String, required: true, unique: true },
        monthlyPrice: { type: Number, required: true },
        annualPrice: { type: Number, required: true },
        current: Boolean,
        available: Boolean,
        features: [
          {
            text: String,
            status: { type: String, enum: ['available', 'limited', 'unavailable'] },
          },
        ],
      },
    ],
  },
  pages: [
    {
      _id: { type: String, required: true, unique: true },
      available: { type: Boolean, default: true },
      type: { type: String, enum: ['production', 'alpha', 'beta'], required: true },
      maintenance: {
        status: { type: Boolean, default: false },
        message: { type: String, default: 'Page is under maintenance. Please try again later.' },
      },
      permission: {
        roles: [
          {
            type: String,
            enum: roles,
            required: true,
            default: ['user'],
          },
        ],
      },
    },
  ],
});

export default model('System', SystemSchema);
