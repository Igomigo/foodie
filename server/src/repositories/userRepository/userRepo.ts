import { Service } from "typedi";
import { User, UserModel } from "../../user/user.model";
import { BaseRepository } from "../baseRepository";
import { IUserRepository } from "./IuserRepo";

@Service()
export class UserRepository extends BaseRepository<User> implements IUserRepository {
    constructor() {
        super(UserModel);
    }

    public async findByEmail(email: string): Promise<User | null> {
        return this.model.findOne({ email });
    }

    public async findByUsername(username: string): Promise<User | null> {
        return this.model.findOne({ username });
    }
}
