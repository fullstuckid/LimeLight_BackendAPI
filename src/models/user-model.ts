import { createHmac, randomUUID } from "crypto";
import { model, Model, Schema } from "mongoose";

export interface UserSchemaType {
  _id: string
  user: {
    username: string
    name: string
    email: string
    password: string
    photo: string
  }
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface UserModel extends Model<UserSchemaType> {
  findUserByUsername: (username: string) => any
  findUserByEmail: (email: string) => any
}

const UserSchema = new Schema<UserSchemaType, UserModel>({
  _id: {
    type: String,
    default: () => randomUUID(),
  },
  user: {
    username: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      default: () => "default.jpg",
    },
  },
  is_verified: {
    type: Boolean,
    default: () => false,
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString(),
  },
  updated_at: {
    type: String,
    default: () => new Date().toISOString(),
  },
}, {
  versionKey: false,
});

UserSchema.statics.findUserByEmail = function (email: string) {
  return this.findOne({
    "user.email": email,
  });
};

UserSchema.statics.findUserByUsername = function (username: string) {
  return this.findOne({
    "user.username": username,
  });
};

UserSchema.pre("save", function () {
  const currentPassword = this.user.password;
  const hashedPassword = createHmac("sha512", this.user.email).update(currentPassword).digest("hex");

  this.user.password = hashedPassword;
});

export const UserModel = model<UserSchemaType, UserModel>("user", UserSchema);
