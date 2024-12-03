import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const TeaseSchema = new Schema({
  _id: { type: Number },
  url: { type: String, required: true, unique: true },
});

export default model('Tease', TeaseSchema);
