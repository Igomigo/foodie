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
};
