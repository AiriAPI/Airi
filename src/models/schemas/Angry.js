import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const AngrySchema = new Schema({
  _id: { type: Number },
  url: { type: String, required: true, unique: true },
});

export default model('Angry', AngrySchema);
