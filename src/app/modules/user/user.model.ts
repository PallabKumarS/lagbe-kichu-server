import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../config';
import { IUser, TUser } from './user.interface';

const userSchema = new Schema<TUser, IUser>(
  {
    name: { type: String, required: true },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ['admin', 'buyer', 'seller'],
      required: true,
    },
    subRole: {
      type: String,
      enum: ['manager', 'accountant', 'inventory_staff'],
    },
    address: { type: String },
    passwordChangedAt: { type: Date },
    userId: { type: String, unique: true },
    isDeleted: { type: Boolean, default: false },
    profileImage: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  // hashing password and save into DB
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );

  // setting sub roles based on roles
  if (this.role === 'seller' && !this.subRole) {
    this.subRole = 'inventory_staff';
  } else if (this.role !== 'seller') {
    this.subRole = undefined;
  }
  next();
});

// set '' after saving password
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

// check user is exists or not
userSchema.statics.isUserExists = async function (email: string) {
  return await UserModel.findOne({ email }).select('+password');
};

// check password is matched or not
userSchema.statics.isPasswordMatched = async function (
  myPlaintextPassword,
  hashedPassword,
) {
  return bcrypt.compare(myPlaintextPassword, hashedPassword);
};

// check if jwt issued before password changed
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number,
) {
  return (
    new Date(passwordChangedTimestamp).getTime() / 1000 > jwtIssuedTimestamp
  );
};

const UserModel = model<TUser, IUser>('User', userSchema);

export default UserModel;
