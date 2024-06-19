import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxLength: 20,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxLength: 70,
    match: /.+\@.+\..+/,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;
