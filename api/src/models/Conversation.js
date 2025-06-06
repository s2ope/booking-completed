import { Schema, model } from 'mongoose';

const MessageSchema = new Schema({
  sender: {
    type: String,
    enum: ['client', 'admin', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ConversationSchema = new Schema({
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  messages: [MessageSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

export default model('Conversation', ConversationSchema);