import mongoose, { Document, Schema, models } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Password will be selected: false in schema
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
      index: true, // Add index for faster queries on email
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      select: false, // Do not return password by default
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Pre-save middleware can be added here if needed later (e.g., for password hashing if not done at API level)

const User = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
