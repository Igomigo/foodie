import { ClientSession } from "mongoose";
import { User, UserModel } from "../../domain/user.model";

type NewUser = Pick<User, "email" | "passwordHash"> &
  Partial<
    Pick<
      User,
      | "username"
      | "firstName"
      | "lastName"
      | "phoneNumber"
      | "location"
      | "roles"
    >
  >;

export const userRepository = {
  async create(data: NewUser, session?: ClientSession) {
    const user = new UserModel(data);
    return user.save({ session });
  },
  findById(id: string) {
    return UserModel.findById(id).exec();
  },
  updateLocation(id: string, location: User["location"]) {
    return UserModel.findByIdAndUpdate(
      id,
      { $set: { location } },
      { new: true, runValidators: true },
    ).exec();
  },
  findForLogin(email: string, session?: ClientSession) {
    return UserModel.findOne({ email })
      .select("+passwordHash")
      .session(session ?? null)
      .exec();
  },
  findByEmailOrUsername(email: string, username?: string) {
    const query = username ? { $or: [{ email }, { username }] } : { email };
    return UserModel.findOne(query).exec();
  },
  reservePasswordReset(email: string, tokenHash: string, expiresAt: Date) {
    return UserModel.findOneAndUpdate(
      {
        email,
        isActive: true,
        $or: [
          { passwordResetRequestedAt: { $exists: false } },
          { passwordResetRequestedAt: { $lt: new Date(Date.now() - 60_000) } },
        ],
      },
      {
        $set: {
          passwordResetTokenHash: tokenHash,
          passwordResetExpiresAt: expiresAt,
          passwordResetRequestedAt: new Date(),
        },
      },
      { new: true },
    ).exec();
  },
  cancelPasswordReset(tokenHash: string) {
    return UserModel.updateOne(
      { passwordResetTokenHash: tokenHash },
      {
        $unset: {
          passwordResetTokenHash: 1,
          passwordResetExpiresAt: 1,
          passwordResetRequestedAt: 1,
        },
      },
    ).exec();
  },
  completePasswordReset(tokenHash: string, passwordHash: string) {
    return UserModel.findOneAndUpdate(
      {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
        isActive: true,
      },
      {
        $set: { passwordHash },
        $inc: { tokenVersion: 1 },
        $unset: {
          passwordResetTokenHash: 1,
          passwordResetExpiresAt: 1,
          passwordResetRequestedAt: 1,
        },
      },
      { new: true },
    ).exec();
  },
};
