import { Schema, model } from 'mongoose';

export interface IUser {
  email: string;
  passwordHash: string;
  name: string;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true }
  },
  { timestamps: true }
);

export const UserModel = model<IUser>('User', userSchema);
