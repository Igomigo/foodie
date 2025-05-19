import { Service } from "typedi";
import { User } from "../../user/user.model";

@Service()
export class SignupService {

    constructor() {}

    public async handler(data: User): Promise<User> {
        return data;
    }
}
