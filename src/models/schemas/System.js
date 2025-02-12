import mongoose from 'mongoose';
const { Schema, model } = mongoose;

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
});

export default model('System', SystemSchema);
