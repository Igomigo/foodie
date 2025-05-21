import { User } from "../../user/user.model";
import { IBaseRepository } from "../baseRepositoryInterface";

export interface IUserRepository extends IBaseRepository<User> {
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
}
